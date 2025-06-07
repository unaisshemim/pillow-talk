import express from "express";
import {
  getNextReflection,
  postReflection,
} from "../controllers/refelectionController";

const router = express.Router();

// GET /api/reflections/next
router.get("/next", getNextReflection);

// POST /api/reflections
router.post("/", postReflection);

export default router;
