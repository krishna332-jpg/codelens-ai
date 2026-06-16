# CodeLens AI

An AI-powered code review tool that gives developers instant, structured feedback on their code. Paste any code snippet, select a language, and get a breakdown of bugs, security vulnerabilities, performance problems, and best practice violations — along with a quality score and actionable fix suggestions.

Built as a production-grade full-stack application with real authentication, persistent history, shareable reviews, and a live deployment.

---

## What it does

When a user submits code, the backend constructs a structured prompt and sends it to the Groq API running Llama 3.3 70B. The model returns a JSON object with categorized issues, severity levels, line references, fix suggestions, a summary, and a 0–100 quality score. That data is saved to MongoDB and rendered in a tabbed review interface on the frontend.

Users can create an account, log in, review code across 14 languages, view their full review history, delete old reviews, and share any review via a unique link.

---

## Tech stack

**Frontend** — React 18, custom CSS with CSS variables, Axios, animated canvas background

**Backend** — Node.js, Express, JWT authentication, rate limiting, REST API

**AI** — Groq API with Llama 3.3 70B Versatile for fast, structured code analysis

**Database** — MongoDB with Mongoose, 30-day TTL on reviews

**Testing** — Jest and Supertest (backend), React Testing Library (frontend)

**Deployment** — Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## Supported languages

JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, Ruby, Kotlin, HTML, CSS, SQL, Swift

---

## Architecture decisions worth noting

**Prompt engineering** — The prompt enforces a strict JSON schema response with no markdown or explanation outside the JSON object. This makes parsing reliable and eliminates the need for complex response handling.

**Guest mode** — The auth middleware allows unauthenticated requests through to the review endpoint but the frontend gates the editor behind a login wall. This keeps the backend flexible without exposing unprotected routes.

**Share links** — Each review gets a short UUID-based `shareId` on creation. The share endpoint is public and does not require authentication, so links work for anyone.

**Keep-alive** — The backend pings itself every 14 minutes to prevent Render's free tier from spinning down, keeping response times fast for demo purposes.

---

## Running locally

**Backend**

```bash
cd backend
npm install
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_string
PORT=5000
```

```bash
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
```

Create a `.env` file:

```
REACT_APP_API_URL=http://localhost:5000
```

```bash
npm start
```

---

## Running tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

Backend tests cover the health check, auth route validation, review input validation, and history route auth protection. Frontend tests cover score color logic, character limits, language list integrity, and severity badge mapping.

---

## Deployment

The frontend is deployed on Vercel with a `vercel.json` rewrite rule to handle client-side routing. The backend is deployed on Render as a Node web service. The database is on MongoDB Atlas free tier.

Environment variables required on Render: `GROQ_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `FRONTEND_URL`

Environment variable required on Vercel: `REACT_APP_API_URL`

---

## Project structure

```
ai-code-reviewer/
    backend/
        middleware/
            auth.js
        models/
            User.js
            Review.js
        routes/
            auth.js
            review.js
            history.js
        tests/
            api.test.js
        server.js
        package.json
    frontend/
        public/
            index.html
        src/
            components/
                AuthModal.js
                ReviewResult.js
                HistoryPanel.js
            hooks/
                useAuth.js
            pages/
                ReviewPage.js
            utils/
                api.js
            App.js
            App.css
        package.json
        vercel.json
```
