# Pillow Talk – Relationship AI Coach

**Pillow Talk** is a private AI-powered relationship support platform designed for couples and individuals. It provides personalized, emotionally-aware guidance through separate conversations with each partner — helping them understand each other better, resolve conflicts, and grow closer without ever exposing one another’s private thoughts.

---

## 🧠 Core Features
- AI therapist chat for solo and partnered users
- Partner invitation and shared lobby system
- Private, separate sessions for each partner
- GPT-powered feedback and conflict insights
- Long-term memory via summaries and Pinecone embeddings
- Personalized tasks and growth tracking

---

## 🧱 Tech Stack
- **Frontend**: React / Next.js (planned)
- **Backend**: Node.js + Express
- **Auth & DB**: Supabase (Postgres + Auth)
- **Memory**: Pinecone (vector DB for embeddings)
- **AI**: OpenAI (ChatGPT + Embeddings API)

---

## ✅ Completed
- Domain purchased: `pillow-talk.live`
- Landing page and waitlist
- Supabase setup with tables:
  - `users`
  - `lobbies`
  - `sessions`
  - `messages`
- Supabase authentication (email/password)
- Partner invite + lobby join API
- Session creation API (`/api/session/start`)
- Created Trello board & Notion roadmap

---

## 🚧 To Do
### 🔹 Chat Session Flow
- [ ] `POST /api/message` – user → GPT → assistant reply
- [ ] `GET /api/messages/:session_id` – load full chat history
- [ ] Save messages in Supabase (role: user/assistant)

### 🔹 Memory System
- [ ] GPT summary after each session
- [ ] Generate + store embedding in Pinecone
- [ ] Fetch top 3 embeddings per user for RAG

### 🔹 Dual Feedback Flow
- [ ] Load partner sessions via `lobby_id`
- [ ] Inject both summaries into GPT prompt
- [ ] Generate personalized insights

### 🔹 Task System (Post-Session)
- [ ] GPT suggests task based on session
- [ ] Track task completion
- [ ] Add `tasks` table

### 🔹 Frontend UI
- [ ] Chat UI
- [ ] Partner dashboard (status, tasks, sessions)
- [ ] Session history & task timeline

---

## ✨ Vision
Pillow Talk aims to become the safest space for couples to grow — using AI to reflect, understand, and reconnect, one conversation at a time.