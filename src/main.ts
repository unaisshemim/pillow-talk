import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import lobbyRoutes from "./routes/lobbyRoutes";
import messageRoutes from "./routes/messageRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import {
  testSupabaseConnection,
  testLocalhostConnection,
  testPineconeConnection,
} from "./connectionTest";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/lobby", lobbyRoutes);
app.use("/api/message", messageRoutes); //add message here and remove from routes
app.use("/api/session", sessionRoutes); //add session here and remove from routes


void testSupabaseConnection();
void testPineconeConnection();

app.listen(PORT, () => {
  testLocalhostConnection(Number(PORT));
});
