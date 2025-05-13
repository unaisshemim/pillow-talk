import express from "express";
import { postMessage, getMessages } from "../controllers/messageController";

const router = express.Router();

// POST /api/message
router.post("/message", postMessage);

// GET /api/messages/:session_id
router.get("/messages/:session_id", getMessages);

export default router;
