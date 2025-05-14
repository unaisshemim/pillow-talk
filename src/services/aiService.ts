import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAIReply(userMessage: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful relationship AI coach." },
        { role: "user", content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    return completion.choices[0].message?.content || "";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "Sorry, I couldn't process your request right now.";
  }
}
