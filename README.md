# 🎙️ Leaty — GenAI-Powered In-Car Voice Assistant

> **Final Year Project | Innovent Hackathon**  
> Built with React (Vite), Node.js/Express, OpenRouter API, MongoDB Atlas, and the Web Speech API

---

## 📌 What is this?

Leaty is a multilingual in-car voice assistant I built as part of a hackathon project. The idea came from a simple frustration — what if you're driving in a foreign country and need help, but can't type or read in that language? Leaty lets you speak a prompt, picks the language you want a response in, and reads the answer back to you out loud.

It's not just a translator — it's a conversational AI assistant that understands context, responds naturally, and speaks back in the target language using real TTS voices available in your browser.

---

## ✨ Features

- 🎤 **Voice Input** — Uses the browser's native Web Speech API for real-time speech-to-text
- 🌍 **Multilingual AI Responses** — Supports French, Spanish, German, Italian, Hindi, Chinese, Arabic, Russian, and English
- 🔊 **Text-to-Speech Output** — Reads the AI's reply aloud using matched language voices
- 💬 **Conversational UI** — Chat-style interface (named "Leaty") with a typing indicator and smooth scroll
- 🚗 **In-Car Dashboard Layout** — Car diagnostics sidebar (engine, tires, battery, oil) + live map panel
- 🔌 **REST API Backend** — Express server routes prompts to OpenRouter's AI API
- 🛢️ **MongoDB Atlas** — Connected for future features like session history and user profiles

---

## 🧱 Architecture

This is a standard **client-server** architecture with a clear separation of concerns:

```
┌───────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              React + Vite (frontend/)                       │  │
│  │                                                             │  │
│  │   InCarAssistantDashboard.jsx                               │  │
│  │   ├── Web Speech API  ──→  speech-to-text (STT)             │  │
│  │   ├── SpeechSynthesis ──→  text-to-speech (TTS)             │  │
│  │   ├── Chat UI         ──→  message state (useState)         │  │
│  │   └── fetch()         ──→  POST /api/openai/translate        │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
                              │  HTTP (REST)
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                     Node.js / Express (backend/)                  │
│                                                                   │
│   index.js                                                        │
│   ├── CORS middleware                                             │
│   ├── express.json() body parser                                  │
│   └── /api/openai  ──→  routes/openai.js                         │
│                                                                   │
│   routes/openai.js                                                │
│   └── POST /translate                                             │
│       ├── Builds a conversational prompt                          │
│       ├── Calls OpenRouter API (axios)                            │
│       └── Returns { translatedText }                             │
│                                                                   │
│   MongoDB Atlas (mongoose)                                        │
│   └── Connected for session/user data (future use)               │
└───────────────────────────────────────────────────────────────────┘
                              │  HTTPS
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                  OpenRouter API (AI Gateway)                      │
│                                                                   │
│   Model: gpt-3.5-turbo (configurable)                             │
│   ├── Receives the user prompt + language instruction             │
│   ├── Generates a friendly, context-aware reply                   │
│   └── Returns response in the specified target language           │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow (one request cycle)

1. User speaks or types a prompt in the browser
2. Web Speech API converts speech → text (happens entirely in the browser, no API cost)
3. React sends a `POST /api/openai/translate` with `{ text, targetLanguage }` to the Express backend
4. The backend builds a system prompt instructing the model to respond in the target language
5. The request goes to OpenRouter → gpt-3.5-turbo → returns the AI reply
6. The backend sends `{ translatedText }` back to the frontend
7. React displays the message in the chat UI and calls `SpeechSynthesisUtterance` to speak it aloud

---

## 🤖 Model & AI Design Choices

### Why OpenRouter?

I used [OpenRouter](https://openrouter.ai) as an API gateway rather than calling OpenAI directly. This gave me a few advantages during development:

- **Flexible model switching** — I can swap between `gpt-3.5-turbo`, `mistral-7b`, `claude-haiku`, etc. without changing code, just the model string
- **Free-tier access** — Some models on OpenRouter have free tiers, which helped when testing
- **Single API key** — One key for multiple model providers

### Why gpt-3.5-turbo?

For this use case (multilingual conversational replies), gpt-3.5-turbo works well:
- Fast response times (important for voice UX — users don't want to wait)
- Strong multilingual support across all 9 languages in the app
- Cheaper than GPT-4, which matters when you're a student with a free API budget

To use a different model, just change this line in `backend/routes/openai.js`:

```js
model: "gpt-3.5-turbo",  // swap to "mistral-7b-instruct" or others
```

### Prompt Design

The prompt I wrote tells the model to act as a friendly conversational assistant — not just a translator:

```
You are a helpful and friendly AI assistant. The following sentence is in [language].
Understand it and reply in the same language, keeping your response clear, polite,
and conversational.
```

This distinction matters a lot. "Translate this text" gives a flat translation. "Understand and reply" gives a response that feels natural in-car, like talking to a person.

### Speech APIs (Browser Native)

Both STT and TTS are handled by the **Web Speech API** — this is built into Chrome and most modern browsers:

| Feature | API Used | Notes |
|---|---|---|
| Speech → Text | `window.SpeechRecognition` | Works offline in Chrome, lang set to `en-US` |
| Text → Speech | `window.SpeechSynthesis` | Matches the target language's voice if available |

No external STT/TTS service is needed, which keeps the cost at zero for those features.

---

## 📁 Project Structure

```
innovent/
├── backend/
│   ├── index.js              # Express app entry point, MongoDB connection
│   ├── routes/
│   │   └── openai.js         # POST /api/openai/translate — calls OpenRouter
│   ├── .env                  # Environment variables (not committed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InCarAssistantDashboard.jsx   # Main UI — chat, mic, map, sidebar
│   │   │   └── Translator.jsx                # Standalone translator component
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites

- Node.js v18+
- A free [OpenRouter](https://openrouter.ai) account for the API key
- A free [MongoDB Atlas](https://cloud.mongodb.com) cluster (or local MongoDB)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd innovent

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Create a `.env` file inside `backend/`:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/leaty
PORT=5000
```

### 3. Run locally

```bash
# Terminal 1 — backend
cd backend
npm run dev        # starts on http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm run dev        # starts on http://localhost:5173
```

Open `http://localhost:5173` in Chrome (Speech API needs Chrome for full support).

---

## 🚀 Deployment Guide

### Frontend → Vercel (Recommended)

Vercel is the easiest option for deploying a Vite/React app. It's free and takes about 2 minutes.

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. Set the **Root Directory** to `frontend`
4. Vercel auto-detects Vite — just click Deploy
5. After deploy, go to **Settings → Environment Variables** and add:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com
   ```
6. In `InCarAssistantDashboard.jsx`, replace the hardcoded URL:
   ```js
   // Before (local dev only)
   fetch("http://localhost:5000/api/openai/translate", ...)
   
   // After (works in prod)
   fetch(`${import.meta.env.VITE_API_URL}/api/openai/translate`, ...)
   ```

### Backend → Render (Recommended Free Tier)

Render offers a free Node.js hosting tier with automatic deploys from GitHub.

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo, set **Root Directory** to `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node index.js`
5. Add environment variables in Render's dashboard:
   ```
   OPENROUTER_API_KEY = your_key
   MONGO_URI = your_mongodb_atlas_uri
   PORT = 10000
   ```
6. Update the `HTTP-Referer` in `routes/openai.js` to your actual Vercel domain:
   ```js
   "HTTP-Referer": "https://your-project.vercel.app/",
   ```

> ⚠️ **Free tier note**: Render's free tier spins down after 15 minutes of inactivity. The first request after idle will take ~30 seconds. For a hackathon demo that's fine, but for production you'd want a paid plan or use Railway instead.

### Alternative: Railway (Backend)

[Railway](https://railway.app) is another good option — $5 free credit/month and no spin-down.

1. New Project → Deploy from GitHub Repo
2. Point to the `backend/` directory
3. Set environment variables in Railway's dashboard
4. Railway auto-detects Node.js and handles the rest

### MongoDB Atlas (Database)

If you haven't set this up yet:

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user (username + password)
3. Whitelist `0.0.0.0/0` (all IPs) under Network Access — needed for Render/Railway
4. Get the connection string from "Connect → Drivers" and paste it as `MONGO_URI`

### Deployment Summary Table

| Layer | Service | Free? | Notes |
|---|---|---|---|
| Frontend | Vercel | ✅ Yes | Best for Vite/React |
| Backend | Render | ✅ Yes | Spins down on free tier |
| Backend (alt) | Railway | ✅ $5 credit | No spin-down |
| Database | MongoDB Atlas | ✅ 512MB free | More than enough |
| AI API | OpenRouter | ✅ Free models | gpt-3.5-turbo is low cost |

---

## 🧩 Known Limitations & Future Ideas

Things I ran out of time for / plan to add:

- **Session history** — MongoDB is connected but not yet used to store past conversations
- **Auth** — Right now there's no login; adding JWT auth would let users see their chat history across sessions
- **Mobile mic support** — The Web Speech API is unreliable on iOS Safari; a fallback to Whisper API would fix this
- **Streaming responses** — Currently the reply appears all at once; streaming would feel much more responsive
- **Wake word** — "Hey Leaty" detection using a client-side model like Picovoice

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| State Management | React Hooks (useState, useEffect, useRef) |
| Backend | Node.js + Express v5 |
| AI API | OpenRouter → gpt-3.5-turbo |
| Database | MongoDB Atlas (Mongoose) |
| Speech-to-Text | Web Speech API (browser native) |
| Text-to-Speech | Web Speech Synthesis API (browser native) |
| HTTP Client (backend) | Axios |

---
# 🌐 Live Demo

## Frontend
[https://your-vercel-url.vercel.app](https://leaty-ai-assistant.vercel.app/)

## Backend
[https://your-render-url.onrender.com](https://leaty-ai-assistant.onrender.com)

## 📝 Notes

- The project description mentions **Next.js** but the actual implementation uses **React + Vite**. I initially planned to use Next.js but switched to Vite early on because it's faster to set up and I didn't need SSR for this use case.
- Speech recognition only works well in **Google Chrome** — Firefox support is partial and Safari support is inconsistent.
- The `Translator.jsx` component is an earlier standalone version I built before integrating everything into the dashboard. It still works independently if needed.

---

*Built during the Innovent Hackathon. Learning as I go — open to feedback and contributions.*
