export interface Lobby {
  id: string;
  creator_id: string;
  partner_id: string | null;
  status: string;
  created_at: string;
  code: string;
  creator: { id: string; name: string } | null; // Changed to object type
  partner: { id: string; name: string } | null; // Changed to object type
}
