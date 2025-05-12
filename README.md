# <img src="https://www.pillow-talk.live/assets/logo-C1kgSa77.png" alt="Pillowtalk Logo" width="60" style="vertical-align:middle; margin-right:10px;"/> Pillow Talk – Relationship AI Coach

## Overview
Pillow Talk is a private AI-powered relationship support platform designed for couples and individuals. It provides personalized, emotionally-aware guidance through separate conversations with each partner — helping them understand each other better, resolve conflicts, and grow closer without ever exposing one another’s private thoughts.

## Table of Contents
- [Overview](#overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Completed](#-completed)
- [To Do](#-to-do)
- [Vision](#-vision)
- [Contributing](#contributing)
- [License](#license)

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

## Contributing
We welcome contributions! Please fork the repository, create a feature branch, and submit a pull request. For major changes, open an issue first to discuss your ideas.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.