import { Metadata } from "./lightweightMetadata";

export interface MessageRequest {
  session_id: string;
  user_id: string;
  role: "user" | "agent";
  content: string;
  metadata?: Metadata;
}
export interface MessageResponse {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  metadata?: Metadata;
}
