import { Metadata } from "./lightweightMetadata";

export interface ChunkSummary {
  session_id: string;
  chunk_index: number;
  metadata: Metadata;
  start_message_id: string;
  end_message_id: string;
  summary_text: String;
  is_summarized?: boolean;
}

export interface ChunkSummaryWithId extends ChunkSummary {
  id: string;
  session_id: string;
  chunk_index: number;
  metadata: Metadata;
  created_at: string;
  start_message_id: string;
  end_message_id: string;
  summary_text: String;
  is_summarized?: boolean;
}
