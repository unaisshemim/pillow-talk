import { Request, Response } from "express";
import { transcribeAudio } from "../services/sttService";

export async function sttHandler(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    const transcript = await transcribeAudio(
      req.file.buffer,
      req.file.mimetype
    );
    res.json({ transcript });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "STT failed" });
  }
}
