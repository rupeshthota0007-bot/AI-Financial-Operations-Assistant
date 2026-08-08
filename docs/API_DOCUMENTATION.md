# OpenAPI REST & WebSockets Specification

## REST API Modules

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticates user and returns JWT token.
- `GET /api/auth/me`: Returns current user profile.

### Ticket Queue (`/api/tickets`)
- `GET /api/tickets`: Returns list of open/resolved dispute tickets.
- `POST /api/tickets`: Submits a new customer support ticket.
- `POST /api/tickets/:id/orchestrate`: Executes multi-agent investigation graph.

### Payments & Refunds (`/api/payments`)
- `GET /api/payments/transactions`: Returns Stripe gateway ledgers.
- `GET /api/payments/refunds`: Returns processed refund list.
- `POST /api/payments/refunds/process`: Executes payment gateway refund.

### Fraud Engine (`/api/fraud`)
- `GET /api/fraud`: Returns active fraud cases.
- `PATCH /api/fraud/:id`: Updates fraud case status and freezes compromised accounts.

### Manager Approvals (`/api/approval`)
- `GET /api/approval`: Returns pending HITL authorization requests.
- `POST /api/approval/:id/action`: Manager approves/rejects request with reason.

### Cryptographic Audit Ledger (`/api/audit`)
- `GET /api/audit`: Returns searchable SHA-256 hash-signed audit logs.

### RAG Knowledge Base (`/api/knowledge`)
- `GET /api/knowledge/documents`: Lists indexed compliance SOPs.
- `GET /api/knowledge/search?query=...`: Performs semantic vector cosine search.

### AI Copilot Chat (`/api/agent/chat`)
- `POST /api/agent/chat`: Handles conversational queries grounded in RAG evidence.

## Real-Time WebSockets (`ws://localhost:5000/ws`)
- `NOTIFICATION_RECEIVED`: Broadcasts push notifications for pending manager approvals and fraud alerts.
- `APPROVAL_STATUS_CHANGED`: Live updates to manager dashboard upon approval sign-off.
