import { RefelctionSourceType } from "../enums/RefelectionRole";

export interface Reflection {
  id?: string;
  user_id: string;
  question: string;
  answer?: string;
  analyzed_user_id?: string; // self or partner
  source_type: RefelctionSourceType;
  index: number;
  created_at?: string;
}
