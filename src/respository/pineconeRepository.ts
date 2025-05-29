import { pc } from "../config/pineconeClient";

type FinalSummary = {
  sessionId: string;
  userId: string;
  summary: string;
  embedding: number[];
  topics: string[];
  tone: string;
  role?: string;
};

export async function upsertFinalSummaryToPineCone(FinalSummary: FinalSummary) {
  try {
    const index = pc.namespace("session");
    const { sessionId, userId, embedding, topics, tone, summary } =
      FinalSummary;
    await index.upsert([
      {
        id: `final_summary_session_${sessionId}`,
        values: embedding,
        metadata: {
          user_id: userId,
          session_id: sessionId,
          summary,
          topics,
          tone,
          type: "final_summary",
          created_at: new Date().toISOString(),
        },
      },
    ]);
    return "final_summary_session_" + sessionId;
  } catch (error) {
    console.error("Error upserting final summary to Pinecone:", error);
    throw error;
  }
}
