import { Request, Response } from "express";
import {
  getLatestIncompleteSelfReflection,
  createNewSelfReflection,
  saveReflection,
  getLastReflectionIndex,
  getReflectionById,
} from "../respository/reflectionRepository";
import {
  analyzeSentiment,
  generateNewUserReflectionQuestion,
  generatePartnerPerspectiveReflectionQuestion,
  generatePreviousUserReflectionQuestion,
} from "../services/reflectionAiService";
import { RefelctionSourceType } from "../enums/RefelectionRole";
import { Reflection, SentimentalAnalysisPromt } from "../types/reflection";
import { insertSentimentalAnalysis } from "../respository/sentimentalAnalysisRepository";
import { getLobbyByUser } from "./lobbyController";
import { getLobbyByUserId } from "../respository/lobbyRepository";

// GET /reflections/next
export const getNextReflection = async (req: Request, res: Response) => {
  try {
    // In real app, user_id should come from auth middleware
    const user_id = req.query.user_id || req.body.user_id;
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }
    // Check for existing incomplete self reflection
    const existing = await getLatestIncompleteSelfReflection(user_id as string);
    if (existing) {
      return res.status(200).json({
        question: existing.question,
        index: existing.index,
        source_type: existing.source_type,
        reflection_id: existing.id,
      });
    }
    // No existing: generate new question using GPT
    const question = await generateNewUserReflectionQuestion();
    const index = await getLastReflectionIndex(user_id);

    // For now, day_index = 1 (or implement logic)
    const newReflection = await createNewSelfReflection({
      user_id: user_id as string,
      question,
      index: index + 1,
      source_type: RefelctionSourceType.SelfBlueprint,
      partner_id: user_id as string, // For self reflections, partner_id is the same as user_id

      // No partner for self reflections
    });
    return res.status(200).json({
      question: newReflection.question,
      index: newReflection.index,
      source_type: newReflection.source_type,
      reflection_id: newReflection.id,
    });
  } catch (error) {
    console.error("Error fetching next reflection:", error);
    res.status(500).json({ error: "Failed to fetch next reflection" });
  }
};

// POST /reflections
export const postReflection = async (req: Request, res: Response) => {
  try {
    const { answer, user_id, reflection_id } = req.body;

    if (!user_id || !answer || !reflection_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const reflection: Reflection | null = await getReflectionById(
      reflection_id
    );

    if (!reflection) {
      return res.status(404).json({ error: "Reflection not found" });
    }

    const index = reflection.index;
    const partner_id = reflection.partner_id;
    if (!partner_id) {
      return res.status(400).json({ error: "Partner ID is required" });
    }

    // 1. Generate emotional analysis
    const analysis: SentimentalAnalysisPromt = await analyzeSentiment(answer);

    // 2. Save in sentimental_analysis table (exclude summary)
    const { summary, ...analysisWithoutSummary } = analysis;
    await insertSentimentalAnalysis({
      user_id,
      partner_id,
      is_self_view: user_id === partner_id,
      source: reflection.source_type,
      ...analysisWithoutSummary,
    });

    // // 3. Update current reflection
    await saveReflection({
      ...reflection,
      answer,
      is_completed: true,
      summary: analysis.summary,
    });

    // // 4. Generate next question based on index
    let nextQuestion: string | undefined = undefined;
    let source_type: RefelctionSourceType = RefelctionSourceType.SelfBlueprint;
    let nextPartnerId: string = user_id;
    let lobby = await getLobbyByUserId(user_id);

    if (index < 10) {
      nextQuestion = await generatePreviousUserReflectionQuestion(
        analysis.summary
      );
      source_type = RefelctionSourceType.SelfBlueprint;
      nextPartnerId = user_id;
    } else if (index < 20) {
      nextQuestion = await generatePartnerPerspectiveReflectionQuestion();
      source_type = RefelctionSourceType.PartnerReflection;
      nextPartnerId = lobby && lobby.partner_id ? lobby.partner_id : user_id;
    }

    if (!nextQuestion) {
      return res
        .status(500)
        .json({ error: "Failed to generate next question" });
    }

    const newReflection = await createNewSelfReflection({
      user_id,
      partner_id: nextPartnerId,
      question: nextQuestion,
      index: index + 1,
      source_type,
    });

    return res.status(201).json({
      message: "Reflection saved and next question created.",
      current_reflection: reflection_id,
      next_reflection: {
        question: newReflection.question,
        index: newReflection.index,
        reflection_id: newReflection.id,
        source_type: newReflection.source_type,
      },
    });
  } catch (error) {
   console.error("Error saving reflection:", error);
    res.status(500).json({ error: "Failed to save reflection" });
  }
};
