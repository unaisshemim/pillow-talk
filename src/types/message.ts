import { Metadata } from "./lightweightMetadata";

export interface MessageRequest {
  session_id: string;
  user_id: string;
  role: "user" | "agent";
  content: string;
  metadata?: Metadata;
  message_index?: number | null;
  is_summarized?: boolean;
}
export interface MessageResponse {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "agent";
  content: string;
  created_at: string;
  metadata?: Metadata;
  message_index?: number | null;
  is_summarized?: boolean;
}
