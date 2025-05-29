// pineconeClient.ts
import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;
if (!apiKey) {
  throw new Error("PINECONE_API_KEY environment variable is not set");
}
const pinecone = new Pinecone({
  apiKey,
});

const pc = pinecone.index("pillow-talk"); // use this for vector operations
export { pinecone,pc }; // use this for admin ops like listIndexes, createIndex
