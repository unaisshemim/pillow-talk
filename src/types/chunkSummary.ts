import { Metadata } from "./lightweightMetadata";

export interface ChunkSummary {
  session_id: string;
  chunk_index: number;
  metadata: Metadata;
}

export interface ChunkSummaryWithId extends ChunkSummary {
  id: string;
  session_id: string;
  chunk_index: number;
  metadata: Metadata;
  timestamp: string;
}
