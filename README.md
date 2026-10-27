# SkillTrack 2.0

A modern, high-performance MERN application for tracking skills, managing career goals, curated learning resources, workspace analytics, PDF reporting, and intelligent AI-driven mentorship.

---

## Tech Stack
- **Frontend**: React 19, Vite, React Router v6, Lucide Icons
- **Backend**: Node.js, Express 5, MongoDB / Mongoose, JWT Authentication
- **AI Engine**: Groq Cloud API (OpenAI-compatible inference, `qwen/qwen3.8-27b`)

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173

# Groq AI Service
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```

Start the backend:
```bash
npm run dev
```
Health Check:
- Root: `http://localhost:5000/`
- API Health: `http://localhost:5000/api/health`

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Configure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## AI Assistant & Features
- **Top Header Quick Access**: One-click navigation to `/assistant` with live model badge indicator.
- **AI Learning Mentor**: Interactive multi-turn chat grounded directly in your tracked skills, active goals, and learning resources.
- **Curated Recommendations**: Personalized curriculum suggestions with difficulty, estimated hours, and direct 1-click **Add to Library** integration.
- **Safe Degradation**: In-memory rate limiting (15 req/min), prompt-injection safeguards, and automatic transient backoff/retry.

---

## Production Deployment Guide

### Backend (Render / Railway / VPS)
1. Set the root directory or service path to `backend/`.
2. Build command: `npm install`
3. Start command: `npm start` (or `node server.js`)
4. Configure environment variables in your hosting dashboard:
   - `PORT`: Automatically provided by Render/Railway (defaults to `5000` if not set)
   - `NODE_ENV`: `production`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A high-entropy secret string
   - `CLIENT_URL`: Your production frontend URL (e.g., `https://your-app.vercel.app`), supports comma-separated URLs
   - `GROQ_API_KEY`: Your Groq Cloud API key
   - `GROQ_MODEL`: `qwen/qwen3.8-27b`

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set the root directory or framework to `frontend/` (Vite preset).
2. Build command: `npm run build`
3. Output directory: `dist`
4. Configure environment variables in your hosting dashboard:
   - `VITE_API_URL`: Your production backend URL ending with `/api` (e.g., `https://your-api.onrender.com/api`)
5. SPA routing rewrites are pre-configured via `vercel.json` and `public/_redirects`.
