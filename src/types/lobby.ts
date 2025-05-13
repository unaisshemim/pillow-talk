export interface Lobby {
  id: string;
  creator_id: string;
  partner_id: string | null;
  status: string;
  created_at: string;
}

