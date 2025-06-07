import { Request, Response } from "express";
import {
  getLatestIncompleteSelfReflection,
  createNewSelfReflection,
  saveReflection,
  getLastReflectionIndex,
} from "../respository/reflectionRepository";
import { generateNewUserReflectionQuestion } from "../services/reflectionAiService";
import { RefelctionSourceType } from "../enums/RefelectionRole";

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
      partner_id:user_id as string, // For self reflections, partner_id is the same as user_id

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
    const {
      question,
      answer,
      analyzed_user_id,
      source_type,
      day_index,
      user_id,
    } = req.body;
    // In real app, user_id should come from auth middleware
    if (!user_id || !question || !answer || !source_type || day_index == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!Object.values(RefelctionSourceType).includes(source_type)) {
      return res.status(400).json({ error: "Invalid source_type" });
    }
    const index = await getLastReflectionIndex(user_id);
    const reflection = await saveReflection({
      user_id,
      question,
      answer,
      analyzed_user_id,
      source_type,
      index: index + 1,
    });
    res.status(201).json(reflection);
  } catch (error) {
    res.status(500).json({ error: "Failed to save reflection" });
  }
};
