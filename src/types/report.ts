export interface Report {
  id: string;
  merged_summary: string;
  tone: any; // JSONB, can be Record<string, any> or a more specific type
  topics: string[];
  suggestions: string;
  created_at: string;

}
