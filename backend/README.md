# Agentic Financial Operations Assistant 🚀

An enterprise-grade **AI Financial Operations Platform** capable of autonomously orchestrating dispute tickets, payment gateway refunds, velocity fraud detection, and compliance verification across enterprise systems with strict **Human-in-the-Loop (HITL)** governance.

---

## 🌟 Key Features

- **Multi-Agent Orchestration**: 14 specialized AI agents working together (Supervisor, Support, Payment, Fraud, Compliance, Approval, Audit, Explainability, Reviewer, etc.).
- **Human-in-the-Loop Safety**: Mandatory manager sign-off for high-value refunds ($500+), account freezes, and policy exceptions.
- **RAG Vector Engine**: 128-dimensional semantic similarity vector store over RBI regulations, SOP-REF-01 policies, and knowledge articles.
- **Tamper-Evident Cryptographic Audit Ledger**: Immutable SHA-256 digital signatures attached to every AI action.
- **Enterprise Dark Mode Glassmorphism UI**: Built with React 19 / Next.js, Tailwind CSS, Lucide icons, and Framer Motion.
- **Real-Time WebSockets**: Instant push notifications for manager approval requests and live agent graph events.
- **Enterprise Simulators**: Built-in mock connectors for Salesforce CRM, Stripe Gateway, Sift Fraud Engine, Slack, and MS Teams.

---

## 🏗️ Quick Start (Local Setup)

### 1. Start Backend API & Database
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
Backend will start on `http://localhost:5000` (WebSocket server active on `ws://localhost:5000/ws`).

### 2. Start Frontend UI
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## 🐳 Docker Deployment
To run the full production environment in Docker containers:
```bash
docker-compose up --build
```

---

## 📚 Documentation
- [Architecture & Multi-Agent Graph](docs/ARCHITECTURE.md)
- [Sequence Diagram](docs/SEQUENCE_DIAGRAM.md)
- [Database ER Diagram](docs/ER_DIAGRAM.md)
- [Agent Prompts & System Instructions](docs/PROMPT_DOCUMENTATION.md)
- [API & WebSocket Documentation](docs/API_DOCUMENTATION.md)
