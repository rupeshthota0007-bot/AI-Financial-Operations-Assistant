# Enterprise Architecture Document - Agentic Financial Operations Assistant

## Executive System Overview

The **Agentic Financial Operations Assistant** is an enterprise-grade AI Operations platform designed to replace manual, fragmented workflows across support tickets, payment gateways, fraud detection engines, CRM databases, and compliance SOPs.

```
                    ┌──────────────────────────────────────────────────┐
                    │               React 19 / Next.js UI              │
                    │        Glassmorphism Enterprise Dashboard        │
                    └────────────────────────┬─────────────────────────┘
                                             │ HTTP REST / WebSockets
                                             ▼
                    ┌──────────────────────────────────────────────────┐
                    │           Express TypeScript API Layer           │
                    │      JWT Auth | RBAC Guard | Socket Gateway     │
                    └────────────────────────┬─────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
         ┌───────────────────────────┐               ┌───────────────────────────┐
         │ Multi-Agent Orchestrator  │               │   RAG Policy Vector Store │
         │   (Supervisor / Planner)  │               │ 128-Dim Cosine Embeddings │
         └─────────────┬─────────────┘               └─────────────┬─────────────┘
                       │                                           │
  ┌────────────────────┼────────────────────┬──────────────────────┤
  ▼                    ▼                    ▼                      ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐       ┌───────────────────┐
│ Support      │ │ Payment      │ │ Fraud        │       │ Compliance Agent  │
│ Agent        │ │ Agent        │ │ Agent        │       │ (RBI / SOP-REF-01)│
└──────────────┘ └──────────────┘ └──────────────┘       └─────────┬─────────┘
                                                                   │
                                                                   ▼
                                                         ┌───────────────────┐
                                                         │ Approval Agent    │
                                                         │ (Human-in-Loop)   │
                                                         └─────────┬─────────┘
                                                                   │
                                                                   ▼
                                                         ┌───────────────────┐
                                                         │ Audit Agent       │
                                                         │ SHA-256 Signatures│
                                                         └───────────────────┘
```

## Core Architectural Pillars

### 1. Multi-Agent Collaboration Graph
Instead of a single unstructured chatbot, the platform deploys **14 specialized AI agents** that run in a DAG (Directed Acyclic Graph) workflow:
- **Supervisor Agent**: Manages master graph execution, task assignment, and response synthesis.
- **Customer Support Agent**: Parses tickets, extracts CRM 360 customer profiles, and measures urgency scores.
- **Payment Investigation Agent**: Inspects Stripe Gateway ledgers, checks duplicate charges, and verifies settlement status.
- **Fraud Detection Agent**: Analyzes velocity spikes, IP proxy anonymizers, and device fingerprints.
- **Compliance Agent**: Enforces SOP-REF-01 caps ($500 ceiling) and RBI financial guidelines.
- **Approval Agent**: Enforces Human-in-the-Loop safeguards when high-risk actions are detected.
- **Audit Agent**: Creates tamper-evident, cryptographic SHA-256 hash-signed ledger logs.
- **Explainability Agent**: Generates plain-English trade-off breakdowns and CSAT impact scores.
- **Self-Review / Self-Critic Agent**: Verifies logic, prevents hallucinations, and enforces safety guardrails.

### 2. Retrieval Augmented Generation (RAG)
Vector embeddings store chunked enterprise knowledge (RBI compliance directives, internal SOPs, refund policies, and historical cases). Prior to every agent action, semantic similarity search retrieves cited evidence.

### 3. Human-in-the-Loop (HITL) Security Policy
High-risk operations (refunds > $500, account freezes, high fraud velocity flags) are **never executed automatically**. The system generates a pending Approval ticket and dispatches instant WebSocket alerts to managers.
