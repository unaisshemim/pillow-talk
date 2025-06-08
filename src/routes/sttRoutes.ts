import express from "express";
import multer from "multer";
import { sttHandler } from "../controllers/sttController";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("audio"), sttHandler);

export default router;
