# 🎓 AI Career Mentor Chatbot

An AI-powered career guidance platform for students and fresh graduates, built with **FastAPI**, **LangChain**, **FAISS**, and **React**.

---

## 📁 Project Structure

```
career-mentor-chatbot/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── render.yaml              # Render deployment config
│   ├── .env.example
│   ├── routers/
│   │   ├── chat.py              # Chat, resume, skill-gap, interview endpoints
│   │   ├── documents.py         # File upload & indexing endpoint
│   │   └── health.py
│   ├── services/
│   │   ├── vector_store.py      # FAISS + embeddings service
│   │   └── mentor_chain.py      # LangChain RAG + CoT chain
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   └── embeddings/              # Auto-created FAISS index (git-ignored)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── render.yaml              # Render static site config
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/api.js      # Axios API client
        ├── hooks/useChat.js     # Chat state management
        ├── components/
        │   ├── ProfileSetup.jsx # Onboarding wizard
        │   ├── Sidebar.jsx      # Navigation
        │   └── ChatMessage.jsx  # Markdown-rendered message bubble
        └── pages/
            ├── ChatPage.jsx     # Main chat interface
            ├── ResumePage.jsx   # Resume analysis tool
            ├── SkillGapPage.jsx # Skill gap analyser
            └── InterviewPage.jsx# Interview prep generator
```

---

## 🛠 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- An OpenAI API key (get one at https://platform.openai.com)

### 1 — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
python main.py
# API docs available at http://localhost:8000/docs
```

### 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000  (already set for local dev)

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

---

## 🚀 Deploying to Render

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/career-mentor-chatbot.git
git push -u origin main
```

### Step 2 — Deploy the Backend (Web Service)

1. Go to https://dashboard.render.com → **New → Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Render will auto-detect `render.yaml`; confirm these settings:
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `OPENAI_API_KEY` → your key (mark as secret)
6. Under **Disks**, add a persistent disk:
   - **Mount Path**: `/var/data`
   - **Size**: 1 GB
   - Set env var `FAISS_INDEX_PATH` = `/var/data/faiss_index`
7. Click **Create Web Service**
8. Note your backend URL: `https://career-mentor-api.onrender.com`

### Step 3 — Deploy the Frontend (Static Site)

1. Go to Render → **New → Static Site**
2. Connect the same repo
3. Set **Root Directory** to `frontend`
4. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://career-mentor-api.onrender.com` ← your backend URL
6. Under **Redirects/Rewrites**, add:
   - Source: `/*` → Destination: `/index.html` → Action: **Rewrite**
   (handles client-side routing)
7. Click **Create Static Site**

### Step 4 — Update CORS

In your backend **Environment Variables** on Render, set:
```
CORS_ORIGINS=https://career-mentor-frontend.onrender.com
```
(Use your actual frontend URL)

Then redeploy the backend.

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat/message` | Main RAG + CoT chat |
| POST | `/api/chat/resume-analysis` | Analyse pasted resume |
| POST | `/api/chat/skill-gap` | Skill gap analysis |
| POST | `/api/chat/interview-questions` | Generate interview Q&A |
| POST | `/api/documents/upload` | Upload PDF/CSV/TXT to knowledge base |

Full interactive docs at `/docs` (Swagger UI).

---

## 🧠 Adding Your Own Knowledge Base

Upload career-related PDFs, CSVs, or text files via:

```bash
curl -X POST https://your-api.onrender.com/api/documents/upload \
  -F "file=@job_descriptions.pdf"
```

Or use the `/docs` Swagger UI to test uploads directly.

Suggested documents to add:
- Job descriptions from LinkedIn/Indeed (CSV export)
- Industry salary reports (PDF)
- Company-specific interview guides
- Course syllabi from Coursera/edX

---

## ⚙️ Environment Variables Reference

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | **Required.** OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | LLM model to use |
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model |
| `FAISS_INDEX_PATH` | `./embeddings/faiss_index` | Where to store the FAISS index |
| `CHUNK_SIZE` | `800` | Document chunk size in tokens |
| `CHUNK_OVERLAP` | `150` | Overlap between chunks |
| `TOP_K_RESULTS` | `5` | Number of RAG results to retrieve |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `""` (empty = same origin) | Backend API base URL |

---

## 🔮 Further Steps & Enhancements

### Phase 2 — Smarter RAG
- [ ] Switch FAISS → **Pinecone** for serverless vector search (no disk needed on Render free tier)
- [ ] Add **hybrid search** (BM25 + embeddings) via LangChain's EnsembleRetriever
- [ ] Implement **contextual compression** to reduce noise in retrieved chunks

### Phase 3 — Better AI
- [ ] Fine-tune an open-source model (Mistral 7B or Llama 3) on career domain data using LoRA/QLoRA
- [ ] Add **streaming** responses via FastAPI `StreamingResponse` + React `EventSource`
- [ ] Use **LangGraph** for multi-step agentic reasoning (e.g. web-search → analyse → recommend)

### Phase 4 — Data & Personalisation
- [ ] Add a **PostgreSQL** database (Render managed DB) to store user sessions and history
- [ ] Implement user authentication (Render + Supabase or Auth0)
- [ ] Build a **job matching** feature: scrape live job postings (Adzuna API) and rank against user profile

### Phase 5 — Production Polish
- [ ] Add **rate limiting** (slowapi) to prevent API abuse
- [ ] Set up **logging** with structlog + Render log streams
- [ ] Add **monitoring** with Sentry (both backend and frontend)
- [ ] Write unit tests with pytest (backend) and Vitest (frontend)
- [ ] Set up CI/CD with GitHub Actions → auto-deploy to Render on merge to main
