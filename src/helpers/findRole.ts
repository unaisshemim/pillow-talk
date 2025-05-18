import { Lobby } from "../types/lobby";
import { SessionRole } from "../enums/sessionRole";
import { getLobbyByUserId } from "../respository/lobbyRepository";

export async function findRole(
  user_id: string
): Promise<{ role: SessionRole; lobby_id: string | null }> {
  const lobby: Lobby = await getLobbyByUserId(user_id);
  let role: SessionRole;
  let lobby_id = lobby?.id || null;
  if (!lobby_id) {
    role = SessionRole.SOLO;
  } else {
    lobby_id = lobby.id;
    role = SessionRole.PARTNER;
  }
  return { role, lobby_id };
}
