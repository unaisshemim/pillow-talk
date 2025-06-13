import express from "express";
import {
  startSession,
  completeSession,
  getUserSessions,
  getSession,
  deleteSession,
  getLobbySessions,
  shareSessionToPartner,
  generateSessionReport,
} from "../controllers/sessionController";

const router = express.Router();

// POST /session/create
router.post("/start", startSession);

// Put /session/:id/complete
router.put("/:sessionId/complete", completeSession);

// GET /users/:user_id/sessions
router.get("/users/:user_id", getUserSessions);

// GET /session/:id
router.get("/:id", getSession);

// DELETE /session/:id
router.delete("/:id", deleteSession);

// GET /sessions?lobby_id=
router.get("/lobby/:lobby_id", getLobbySessions);

//post /session/share-with-partner
router.post("/share-to-partner", shareSessionToPartner);

// POST /sessions/:id/generate-report
router.post("/:id/generate-report", generateSessionReport);

export default router;
