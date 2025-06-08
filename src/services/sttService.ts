import axios from "axios";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_API_URL = "https://api.deepgram.com/v1/listen";

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimetype: string
): Promise<string> {
  if (!DEEPGRAM_API_KEY) throw new Error("Deepgram API key not set");
  const response = await axios.post(DEEPGRAM_API_URL, audioBuffer, {
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": mimetype,
    },
  });
  return response.data.results.channels[0].alternatives[0].transcript;
}
