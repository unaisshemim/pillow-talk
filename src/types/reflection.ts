// SentimentalAnalysis interface for sentimental_analysis table

import { RefelctionSourceType } from "../enums/RefelectionRole";
export interface SentimentalAnalysis {
  id?: string;
  user_id: string;
  partner_id: string;
  is_self_view: boolean;
  analysis_date?: string;
  self_awareness?: number;
  emotional_expression?: number;
  attachment_secure?: number;
  attachment_anxious?: number;
  attachment_avoidant?: number;
  attachment_fearful?: number;
  communication_empathic?: number;
  communication_aggressive?: number;
  communication_passive?: number;
  conflict_avoidance?: number;
  conflict_confrontation?: number;
  conflict_compromise?: number;
  growth_mindset?: number;
  values_alignment?: number;
  past_patterns_toxic?: number;
  love_language_quality_time?: number;
  love_language_words?: number;
  love_language_touch?: number;
  love_language_gifts?: number;
  love_language_service?: number;
  relationship_expectations?: number;
  source?: string;
  interpretation?: string;
  version?: string;
  confidence_score?: number;
}

export interface SentimentalAnalysisPromt {
  self_awareness?: number;
  emotional_expression?: number;
  attachment_secure?: number;
  attachment_anxious?: number;
  attachment_avoidant?: number;
  attachment_fearful?: number;
  communication_empathic?: number;
  communication_aggressive?: number;
  communication_passive?: number;
  conflict_avoidance?: number;
  conflict_confrontation?: number;
  conflict_compromise?: number;
  growth_mindset?: number;
  values_alignment?: number;
  past_patterns_toxic?: number;
  love_language_quality_time?: number;
  love_language_words?: number;
  love_language_touch?: number;
  love_language_gifts?: number;
  love_language_service?: number;
  relationship_expectations?: number;
  source?: string;
  interpretation?: string;
  confidence_score?: number;
  summary: string;
}

export interface Reflection {
  id?: string;
  user_id: string;
  question: string;
  answer?: string;
  partner_id?: string; // self or partner
  source_type: RefelctionSourceType;
  index: number;
  created_at?: string;
  is_completed?: boolean;
  summary?: string;
}

export interface ReflectionUpdate {}
