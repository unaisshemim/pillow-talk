import express from "express";
import userRoutes from "./routes/userRoutes";
import lobbyRoutes from "./routes/lobbyRoutes";
import messageRoutes from "./routes/messageRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import {
  testSupabaseConnection,
  testLocalhostConnection,
} from "./connectionTest";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/lobby", lobbyRoutes);
app.use("/api/", messageRoutes);//add message here and remove from routes
app.use("/api/session", sessionRoutes);//add session here and remove from routes

app.get("/", (req, res) => {
  res.send("Hello, Worlds!");
});

void testSupabaseConnection();

app.listen(PORT, () => {
  testLocalhostConnection(Number(PORT));
});
