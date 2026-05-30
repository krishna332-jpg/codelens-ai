# ⬡ CodeLens AI — AI-Powered Code Reviewer

An AI-powered code review tool that instantly detects bugs, security vulnerabilities, performance issues, and best practice violations in your code.

**Built with:** React · Node.js · Express · MongoDB · Anthropic Claude API  
**Deployed on:** Vercel (frontend) + Render (backend) — both free!

---

## ✨ Features

- 🤖 **AI Code Review** — Powered by Claude (Anthropic)
- 🐛 **Bug Detection** — Catches errors with severity levels
- 🔐 **Security Analysis** — SQL injection, XSS, secrets exposure, etc.
- ⚡ **Performance Tips** — Algorithmic improvements, memory leaks
- 📐 **Best Practices** — Language-specific coding standards
- 📊 **Quality Score** — 0–100 score with visual ring
- 🔗 **Share Reviews** — Shareable link for each review
- 📋 **History** — Save & manage all past reviews (login required)
- 🌙 **Dark/Light Mode** — Toggleable theme
- 14 Languages supported

---

## 🚀 Deploy in 1 Day — Step by Step

### Step 1: Get your API keys (Free)

#### Anthropic API Key
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up → Go to **API Keys** → Create new key
3. Copy the key (starts with `sk-ant-...`)
4. New accounts get **$5 free credits** ✅

#### MongoDB Atlas (Free Database)
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up → Create a free cluster (M0 - Free Forever)
3. Create a database user (username + password)
4. Under **Network Access** → Add IP: `0.0.0.0/0` (allow all)
5. Under **Connect** → Connect your application → Copy the URI
   - Replace `<password>` with your DB user password
   - Example: `mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/codelens`

---

### Step 2: Push code to GitHub

```bash
# In the root folder (ai-code-reviewer/)
git init
git add .
git commit -m "Initial commit: CodeLens AI"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/codelens-ai.git
git push -u origin main
```

---

### Step 3: Deploy Backend on Render (Free)

1. Go to [https://render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name:** `codelens-ai-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = some-long-random-secret-string-here
   FRONTEND_URL = https://your-vercel-app.vercel.app
   NODE_ENV = production
   ```
6. Click **Create Web Service**
7. Wait ~3 minutes → Copy your Render URL (e.g. `https://codelens-ai-backend.onrender.com`)

---

### Step 4: Deploy Frontend on Vercel (Free)

1. Go to [https://vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project** → Import your repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
4. Under **Environment Variables**, add:
   ```
   REACT_APP_API_URL = https://codelens-ai-backend.onrender.com
   ```
5. Click **Deploy**
6. Wait ~2 minutes → Your app is live! 🎉

---

### Step 5: Update FRONTEND_URL in Render

1. Go back to Render → Your backend service → Environment
2. Update `FRONTEND_URL` to your Vercel URL
3. Click **Save Changes** (auto-redeploys)

---

## 💻 Run Locally

### Backend
```bash
cd backend
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev       # Starts on http://localhost:5000
npm test          # Run tests
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000
npm install
npm start         # Starts on http://localhost:3000
npm test          # Run tests
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend && npm test
```
Tests cover:
- Health check endpoint
- Auth routes (register/login validation)
- Review route (input validation)
- History route (auth protection)

### Frontend Tests
```bash
cd frontend && npm test
```
Tests cover:
- Score color logic
- Character count limits
- Language list validation
- Severity badge mapping

---

## 📁 Project Structure

```
ai-code-reviewer/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Review.js         # Review schema
│   ├── routes/
│   │   ├── auth.js           # Login/Register
│   │   ├── review.js         # AI review + share
│   │   └── history.js        # User history CRUD
│   ├── tests/
│   │   └── api.test.js       # API tests (Jest + Supertest)
│   ├── server.js             # Express app
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReviewResult.js   # Review display + tabs
│   │   │   ├── AuthModal.js      # Login/Register modal
│   │   │   └── HistoryPanel.js   # Review history
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Auth context
│   │   ├── pages/
│   │   │   └── ReviewPage.js     # Main editor page
│   │   ├── utils/
│   │   │   └── api.js            # Axios API client
│   │   ├── App.js
│   │   ├── App.css
│   │   └── App.test.js       # Frontend tests
│   └── package.json
└── README.md
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 | Component-based, industry standard |
| Styling | CSS Variables + Custom Design | Production-grade, no external dependency |
| Backend | Node.js + Express | Fast, lightweight REST API |
| AI | Anthropic Claude API | Most accurate code analysis |
| Database | MongoDB + Mongoose | Flexible schema for reviews |
| Auth | JWT (JSON Web Tokens) | Stateless, scalable |
| Testing | Jest + Supertest + RTL | Full coverage backend + frontend |
| Deployment | Vercel + Render | Free, production-grade |

---

## 🎤 How to Talk About This in Interviews

**"What did you build?"**
> "I built CodeLens AI — a full-stack SaaS tool that uses Claude's AI to review code in real time. Users paste code, select a language, and get a detailed breakdown of bugs, security vulnerabilities, performance issues, and best practices with a quality score."

**"What was challenging?"**
> "Structuring the AI prompt to return consistent, parseable JSON for different issue categories, and handling edge cases like malformed responses. Also implementing JWT auth with optional guest mode."

**"How is it tested?"**
> "I wrote Jest + Supertest tests for all backend routes covering validation, auth, and error handling, plus React Testing Library tests for frontend logic."

**"How did you deploy it?"**
> "Frontend on Vercel, backend on Render, database on MongoDB Atlas — all free tiers. CI/CD is automatic on every git push."

---

## 📄 License

MIT — free to use, modify, and deploy.
