import { ChunkSummaryWithId } from "../types/chunkSummary";

export function mergeSummaryText(chunks: ChunkSummaryWithId[]): string {
  return chunks
    .slice()
    .reverse()
    .map((chunk) => chunk.summary_text)
    .join(" ");
}
