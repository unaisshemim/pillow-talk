import express from "express";
import { postMessage, getMessages } from "../controllers/messageController";

const router = express.Router();

// POST /api/message
router.post("/", postMessage);

// GET /api/messages/:session_id
router.get("/:session_id", getMessages);

export default router;
