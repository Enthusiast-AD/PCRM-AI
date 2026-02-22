# P-CRM + AI Co-Pilot for Politicians
## Product Requirements Document (PRD)

**Version:** 1.0.0  
**Last Updated:** February 22, 2026  
**Status:** Active Development  
**Category:** Politics & Civic Tech — AI-Powered Governance  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [User Personas](#4-user-personas)
5. [System Architecture](#5-system-architecture)
6. [Tech Stack](#6-tech-stack)
7. [Feature Specifications](#7-feature-specifications)
8. [Data Models](#8-data-models)
9. [API Contracts](#9-api-contracts)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Security & Compliance](#11-security--compliance)
12. [Out of Scope (v1.0)](#12-out-of-scope-v10)
13. [Success Metrics](#13-success-metrics)
14. [14-Day Development Timeline](#14-14-day-development-timeline)
15. [MVP Definition](#15-mvp-definition)
16. [Risk Register](#16-risk-register)

---

## 1. Executive Summary

**P-CRM + AI Co-Pilot** is a unified digital command center for political offices in India. It combines a Smart Political CRM (for office staff to manage citizen grievances) with an AI Co-Pilot (for the politician to get real-time intelligent briefings, draft communications, and make faster decisions).

The platform eliminates the manual, fragmented, paper-based chaos of constituency management — replacing it with an omnichannel intake system, AI-powered classification and routing, real-time tracking dashboards, and a conversational AI assistant trained on the politician's own constituency data.

**Target Market:** MLA/MP offices, Municipal Councillors, Political Party War Rooms  
**Primary Language:** English interface with Hindi + regional language citizen-facing channels  
**Deployment:** Cloud-hosted SaaS (Vercel + Railway/Render)  

---

## 2. Problem Statement

Political offices in India manage thousands of citizen grievances monthly through entirely manual, fragmented, and unscalable processes:

- Citizens submit complaints via WhatsApp, phone calls, walk-ins, and letters — with zero unified inbox
- Office staff maintain physical registers and WhatsApp groups with no status tracking
- The MLA/MP has zero real-time visibility into what's happening in their constituency
- Average grievance resolution takes 15–30 days due to poor routing and follow-up
- Complaints are routinely lost, forgotten, or duplicated
- The politician spends hours manually reading files instead of governing
- No data exists on recurring issues, hot-zones, or team performance

**Core Hypothesis:** If political offices had a system that automatically receives, classifies, routes, and tracks grievances — and gave the politician an AI assistant to stay informed without manual effort — resolution times would drop by 60%+ and constituent satisfaction would improve measurably.

---

## 3. Solution Overview

The platform is one product with two distinct interfaces:

### P-CRM (Staff Interface)
A web-based CRM dashboard where office staff (PA, ward workers) manage the full lifecycle of citizen grievances — from intake to resolution — with AI handling classification, routing, and reply drafting automatically.

### AI Co-Pilot (Politician Interface)
A personal AI panel for the MLA/MP that delivers a daily auto-generated morning briefing and a conversational chat interface to query constituency data, generate speeches, draft media responses, and get instant insights — without touching the CRM manually.

### How They Connect
Every grievance that enters the CRM is available as context to the AI Co-Pilot. The Co-Pilot reads from the same database and provides the politician with a high-level, intelligent view of the same data their staff is managing on the ground.

---

## 4. User Personas

### Persona A — The Politician (MLA/MP)
**Goal:** Stay informed about their constituency in under 15 minutes per day, communicate effectively, and make faster decisions.  
**Pain Point:** Reads 200+ WhatsApp messages daily. Has no structured briefing. Writes speeches manually. Doesn't know which wards have the most problems.  
**Tech Comfort:** Low-moderate. Needs a clean, conversational interface. Uses mobile primarily.  
**Key Feature:** AI Co-Pilot morning briefing + conversational Q&A.

### Persona B — The PA / Chief of Staff
**Goal:** Manage all grievances centrally, assign tasks to the right people, and ensure nothing falls through the cracks.  
**Pain Point:** Manages 5–10 ward workers via WhatsApp groups. No SLA enforcement. Spends 3 hours/day just organizing complaints.  
**Tech Comfort:** Moderate. Comfortable with web dashboards.  
**Key Feature:** Unified inbox, assignment engine, SLA tracker, team overview.

### Persona C — The Ward Worker / Field Staff
**Goal:** Know exactly what tasks are assigned to them and update status from the field quickly.  
**Pain Point:** Receives tasks informally. No way to log updates. PA calls them 5 times a day for status.  
**Tech Comfort:** Low. Primarily uses mobile. Prefers Hindi.  
**Key Feature:** Mobile-friendly task list with simple status update buttons.

### Persona D — The Citizen
**Goal:** Submit a complaint easily, get confirmation it was received, and know when it's resolved — without visiting the office.  
**Pain Point:** Has to physically visit the office or call endlessly. Never knows if their complaint was actually heard.  
**Tech Comfort:** Variable. WhatsApp is universal. Web form for educated citizens.  
**Key Feature:** WhatsApp bot intake + SMS status notifications.

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTAKE LAYER                             │
│   WhatsApp Bot (Twilio)  │  Web Form  │  Voice Call (Bhashini) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API (FastAPI)                        │
│   Complaint Ingestion  │  Auth/RBAC  │  WebSocket Handler       │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│  AI INTELLIGENCE│  │  POSTGRESQL  │  │   REDIS QUEUE    │
│  LAYER          │  │  DATABASE    │  │   (Celery)       │
│  Claude API     │  │  (Supabase)  │  │                  │
│  Bhashini ASR   │  └──────────────┘  └──────────────────┘
│  Whisper STT    │
└─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   P-CRM UI      │  │  AI CO-PILOT │  │  NOTIFICATION    │
│   (React)       │  │  UI (React)  │  │  ENGINE          │
│   Staff View    │  │  Politician  │  │  Twilio SMS      │
│                 │  │  View        │  │  WhatsApp        │
└─────────────────┘  └──────────────┘  └──────────────────┘
```

### Core Architecture Decisions

**Monorepo structure** — frontend and backend in one repo for easier deployment and shared types.  
**Event-driven complaint processing** — complaints enter a Redis queue and are processed asynchronously so the API never blocks on AI calls.  
**Structured AI outputs** — all Claude API calls return strict JSON schemas, never free-form text, to prevent hallucination affecting database records.  
**Separate politician and staff frontends** — same React codebase, different route-guarded layouts based on RBAC role.

---

## 6. Tech Stack

### Frontend

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast builds, hot reload, industry standard |
| Styling | Tailwind CSS | Rapid UI development, consistent design |
| UI Components | shadcn/ui | Accessible, customizable, no overhead |
| State Management | Zustand | Simpler than Redux, perfect for this scale |
| Charts & Analytics | Recharts | React-native, lightweight |
| Maps & Heatmaps | Leaflet.js + react-leaflet | Open source, ward-level GeoJSON support |
| Real-time Updates | WebSocket (native browser API) | Live ticket status without polling |
| HTTP Client | Axios | Request interceptors for JWT handling |
| Form Handling | React Hook Form + Zod | Type-safe form validation |
| Routing | React Router v6 | Route-based RBAC guards |

### Backend

| Layer | Technology | Reason |
|---|---|---|
| Framework | FastAPI (Python 3.11) | Async support, auto docs, best for AI integrations |
| ORM | SQLAlchemy 2.0 + Alembic | Type-safe queries, migration management |
| Task Queue | Celery + Redis | Async AI processing, prevent API blocking |
| WebSockets | FastAPI WebSockets | Real-time dashboard updates |
| Authentication | JWT (python-jose) + bcrypt | Stateless, secure, standard |
| Validation | Pydantic v2 | Request/response validation, schema enforcement |
| Scheduling | APScheduler | Daily morning briefing auto-generation at 7 AM |
| File Handling | python-multipart | Voice recording uploads |

### Database & Storage

| Layer | Technology | Reason |
|---|---|---|
| Primary Database | PostgreSQL 15 (via Supabase) | Relational, reliable, managed hosting |
| Cache & Queue Broker | Redis (via Upstash) | Celery broker, session cache, rate limiting |
| File Storage | Cloudflare R2 | Cheaper than S3, voice recording storage |
| Full-text Search | PostgreSQL FTS (tsvector) | Complaint search without extra infra |

### AI / ML Layer

| Purpose | Technology | Notes |
|---|---|---|
| LLM (Classification, Co-Pilot, Drafting) | Claude API — claude-sonnet-4-6 | Primary intelligence layer |
| Indian Language ASR | Bhashini API (ULCA) | Hindi, Tamil, Telugu, Bengali, etc. |
| English / Fallback ASR | OpenAI Whisper API | For noisy audio, English, Hinglish |
| Multilingual Translation | Bhashini NMT | For citizen-facing content |
| Audio Format Conversion | FFmpeg (server-side) | WebM → WAV for Bhashini compatibility |

### Communication

| Purpose | Technology | Notes |
|---|---|---|
| WhatsApp Bot | Twilio WhatsApp Sandbox | Use WATI for production |
| SMS Notifications | MSG91 | Cheaper than Twilio for India, DLT registered |
| Email (Staff) | Resend.com | Modern, developer-friendly, free tier |

### DevOps & Deployment

| Purpose | Technology | Notes |
|---|---|---|
| Frontend Hosting | Vercel | Free tier, instant deploy from Git |
| Backend Hosting | Railway.app | Simple, supports Python, managed env vars |
| Database | Supabase (managed PostgreSQL) | Free tier for dev, built-in auth bonus |
| Redis | Upstash | Serverless Redis, free tier |
| File Storage | Cloudflare R2 | Free egress, S3-compatible API |
| Container (local dev) | Docker Compose | Consistent local environment |
| CI/CD | GitHub Actions | Lint → test → deploy on push to main |
| Environment Config | python-dotenv + .env files | Standard, never commit secrets |

### Development Tools

| Purpose | Technology |
|---|---|
| Language (Backend) | Python 3.11 |
| Language (Frontend) | TypeScript 5 |
| Package Manager (FE) | pnpm |
| Package Manager (BE) | pip + requirements.txt |
| Code Formatting | Black (Python) + Prettier (TS) |
| Linting | Ruff (Python) + ESLint (TS) |
| API Documentation | FastAPI auto-docs (Swagger UI at /docs) |
| Testing | pytest (BE) + Vitest (FE) |

---

## 7. Feature Specifications

---

### Feature 1: Omnichannel Grievance Intake

**Priority:** P0 (Must Have)

**Description:** Accept citizen complaints from three channels — web form, WhatsApp bot, and voice call transcription — and unify them into a single complaint ticket in the database.

**Web Form Requirements:**
- Public-facing, embeddable on any website via iframe
- Fields: Full Name, Phone Number (required), Ward/Area, Complaint Category (optional — AI will classify), Description (min 20 chars), Photo attachment (optional, max 5MB)
- Available in English and Hindi (toggle)
- Mobile-responsive
- On submission: create ticket → send to AI classification queue → return ticket ID to citizen → trigger SMS acknowledgment

**WhatsApp Bot Requirements:**
- Triggered when citizen messages the registered Twilio number
- Guided flow: greeting → ask name → ask ward → ask issue description → ask for photo (optional) → confirm submission → send ticket ID
- Supports Hindi and English in same conversation
- Citizen can check status anytime by typing their ticket ID
- Uses Twilio WhatsApp Sandbox for v1, WATI for production

**Voice Call Requirements:**
- Staff can upload a recorded call (MP3/WAV/WebM) to the dashboard
- System converts audio to WAV via FFmpeg if needed
- Sends to Bhashini ASR API for Indian languages OR Whisper for English/Hinglish
- Transcription is displayed for staff review
- Staff confirms accuracy, then ticket is created from the transcription
- Fully automated flow is v2

**Common Behavior (All Channels):**
- Every complaint creates one row in the `complaints` table
- Ticket ID format: `CMP-YYYYMM-XXXXX` (e.g., CMP-202602-00047)
- SMS acknowledgment sent to citizen within 60 seconds via MSG91
- Complaint enters Redis queue for AI processing immediately after creation

---

### Feature 2: AI Classification & Routing Engine

**Priority:** P0 (Must Have)

**Description:** Every new complaint is automatically classified, prioritized, summarized, and routed using Claude API with strict JSON output enforcement.

**Claude API Prompt Contract:**

The system sends each complaint with the following context to Claude:
- Raw complaint text
- Channel (web/whatsapp/voice)
- Citizen's ward/area if provided
- Available team members and their roles
- Current team workload (ticket counts)

Claude must return a JSON object with this exact schema:

```json
{
  "category": "string (one of: Water Supply, Roads & Infrastructure, Electricity, Healthcare, Education, Law & Order, Employment, Land Records, Sanitation, Other)",
  "subcategory": "string (more specific e.g. 'Pothole', 'Streetlight', 'Hospital Staff')",
  "priority": "integer (1-5, where 5 is most urgent)",
  "priority_reason": "string (one sentence explaining the priority score)",
  "summary": "string (1-2 sentence plain language summary of the complaint)",
  "suggested_assignee_role": "string (Field Worker / PA / Coordinator / Escalate to MLA)",
  "suggested_action": "string (what should be done first)",
  "draft_reply_citizen": "string (SMS-length reply to send citizen, max 160 chars, in same language as complaint)",
  "language_detected": "string (Hindi / English / Tamil / etc.)",
  "tags": ["array", "of", "relevant", "tags"]
}
```

**Priority Rules (injected into system prompt):**
- Priority 5: Medical emergency, safety hazard, child welfare
- Priority 4: No water/electricity for 24+ hours, road accident risk
- Priority 3: Infrastructure failure affecting 50+ people
- Priority 2: Individual service complaint with clear resolution path
- Priority 1: General feedback, non-urgent requests

**Routing Logic (post-AI):**
- If category matches a ward worker's specialty → auto-assign to that worker
- If priority is 5 → immediately notify PA via SMS regardless of assignment
- If workload of suggested assignee > 20 open tickets → assign to next available

**Accuracy Target:** 85%+ correct classification on held-out test set of 100 complaints before go-live.

**Fallback:** If Claude API call fails or returns invalid JSON → ticket is created with `category: "Unclassified"` and `priority: 3` → PA is notified to manually review.

---

### Feature 3: Staff CRM Dashboard

**Priority:** P0 (Must Have)

**Description:** React-based web dashboard for office staff to manage all grievances with full visibility and control.

**Views:**

**Inbox View (Default)**
- List of all complaints sorted by priority (desc) then created_at (desc)
- Filter bar: Category, Status, Assignee, Ward, Date Range, Priority
- Search bar (full-text search on complaint description)
- Each row shows: Ticket ID, Citizen Name, Category badge, Priority indicator (color-coded), Status pill, Assignee avatar, SLA countdown timer, Created date
- Clicking a row opens the Ticket Detail panel in a slide-over (no full page reload)
- Bulk actions: Assign to, Change Status, Export selected

**Ticket Detail Panel**
- Left column: Citizen info (name, phone, channel icon), complaint raw text, attached photo, AI summary, detected language, AI tags
- Middle column: Category, Subcategory, Priority, Assignee (editable dropdown), Status (editable dropdown with stage transitions), SLA deadline and time remaining, Ward
- Right column: Activity log (all status changes with timestamp and user), Notes (staff can add internal notes), Citizen communication log (all SMS sent)
- Action buttons: Send AI Draft Reply (pre-fills with Claude's draft, staff can edit before sending), Add Note, Reassign, Change Status, Escalate
- Every action is logged to `complaint_history` table with user ID and timestamp

**Team View**
- Table of all team members: Name, Role, Active Tickets, Avg Resolution Time, Tickets Resolved This Month
- Clicking a team member filters the inbox to their assigned tickets

**SLA Tracker View**
- Dedicated view showing only tickets that have breached or are within 2 hours of breaching SLA
- Color coding: Green (>50% time remaining), Yellow (>0% but <50%), Red (breached)
- SLA configurations (editable by PA): Water Supply 48h, Electricity 48h, Roads 7d, Healthcare 24h, Other 5d

**Analytics View**
- Total complaints by month (bar chart)
- Category breakdown (donut chart)
- Average resolution time by category (horizontal bar chart)
- Team performance (table)
- Ward-level heatmap (Leaflet.js with GeoJSON overlay, color intensity = complaint density)
- All charts update in real-time via WebSocket connection

---

### Feature 4: Workflow & Assignment Engine

**Priority:** P0 (Must Have)

**Description:** Rules-based workflow engine for task lifecycle management with escalation logic.

**Status State Machine:**

```
New → Acknowledged → In Progress → Resolved → Closed
         ↓                 ↓
      Escalated ←──────────┘
```

Rules:
- `New → Acknowledged`: Happens when ticket is first assigned to a team member (auto or manual)
- `Acknowledged → In Progress`: Team member manually moves when they start working
- `In Progress → Resolved`: Team member marks resolved, must add a resolution note
- `Resolved → Closed`: Citizen receives SMS asking to confirm, auto-closes after 48h if no response
- Any status → `Escalated`: PA or politician can escalate at any time

**SLA Breach Automation (Celery Beat scheduled task, runs every 15 minutes):**
- Query all open tickets where `sla_deadline < NOW()`
- Set `is_sla_breached = true`
- Send SMS to assigned team member and PA
- Add system note to complaint history
- Increment assignee's `sla_breach_count`

**Notification Events:**
- Ticket created → SMS to citizen (ticket ID + acknowledgment)
- Ticket assigned → In-app notification + SMS to assignee
- SLA breach → SMS to assignee + PA
- Ticket resolved → SMS to citizen (what was done)
- Priority 5 ticket created → Immediate SMS to PA

---

### Feature 5: AI Co-Pilot — Morning Briefing

**Priority:** P0 (Must Have)

**Description:** Auto-generated daily intelligence briefing for the politician, ready every morning at 7 AM without any manual input.

**Briefing Components:**

**Stats Summary Card:**
- Total open complaints (and % change from last week)
- New complaints since yesterday
- Tickets resolved today
- SLA breaches active

**Urgent Cases Panel:**
- Top 5 tickets by priority score
- Each shows: Ticket ID, one-line AI summary, citizen name, ward, time open, current status
- Direct link to full ticket

**Category Distribution Chart:**
- Donut chart showing complaint breakdown by category for current month
- Toggle: This Month / Last 30 Days / This Week

**Ward Heatmap:**
- Leaflet.js map of the constituency
- Ward polygons colored by complaint density (white → light orange → dark red)
- Clicking a ward shows complaint count and top issue for that ward

**Trend Alert:**
- AI-generated single sentence: "Water supply complaints increased 60% in Ward 3 vs last month — 14 open tickets."
- Claude compares this week's category counts vs last week's and generates the alert text

**Generation Mechanism:**
- APScheduler triggers a Celery task at 7:00 AM daily
- Task queries the database for all required stats
- Stats are passed to Claude with a briefing generation prompt
- Generated briefing is saved to `briefings` table
- Politician opens app → latest briefing is shown immediately (no API call at load time)

---

### Feature 6: AI Co-Pilot — Conversational Panel

**Priority:** P0 (Must Have)

**Description:** A chat interface for the politician to query their constituency data, generate content, and get instant AI-powered answers.

**Supported Query Types (v1.0):**

**Data Queries** — Claude receives the question + relevant database query results and generates a natural language answer:
- "Which ward has the most unresolved complaints?"
- "What is the average resolution time for water supply issues?"
- "How many complaints were resolved this month vs last month?"
- "Show me all priority 5 complaints from the last 7 days"

**Speech & Statement Generation** — Claude receives the question + last 30 days of resolved complaint stats and generates a full draft:
- "Draft a 5-minute speech for tomorrow's constituency meeting"
- "Write a press statement about what our office accomplished this month"
- "Give me talking points for the water crisis issue in Ward 5"

**Media Response Generation** — Claude uses real CRM data to draft factual, credible replies:
- "Draft a reply to the Times of India reporter asking about road conditions"
- "Write a social media post about the 200 complaints we resolved this week"

**Reply Drafting:**
- "Draft a reply to this citizen's complaint about [issue]" (staff can also trigger this from ticket detail)

**Technical Implementation:**
- Chat history maintained in React state (not database) — conversation resets on page refresh (v1 intentional)
- Each message sends: user query + last 10 messages as history + relevant DB data fetched by query type
- Claude API called with system prompt establishing Co-Pilot persona and data context
- Response streams to UI for perceived performance (streaming mode)
- All generated content is editable in a text area before copy/use
- Politician can click "Copy" or "Email to Team" on any generated content

---

### Feature 7: Citizen Notification & Transparency

**Priority:** P1 (Should Have)**

**Description:** Keep citizens informed at every stage without requiring them to visit the office or call.

**SMS Events (MSG91):**
1. Complaint Received: "Your complaint [CMP-202602-00047] has been registered. We will update you on progress. Reply with your ticket ID to check status."
2. Complaint Resolved: "Your complaint [CMP-202602-00047] regarding [category] has been resolved. Action taken: [resolution_note_first_100_chars]. Was this helpful? Reply YES or NO."
3. SLA Warning (if configured): "Your complaint [ticket_id] is still being worked on. We apologize for the delay. Our team will update you within 24 hours."

**WhatsApp Status Check:**
- Citizen sends their ticket ID to the WhatsApp bot
- Bot queries the database and returns: current status, assignee name, last update, estimated resolution (if set)
- Available 24/7 without staff involvement

---

### Feature 8: Analytics & Reporting

**Priority:** P1 (Should Have)**

**Description:** Data-driven insights for the PA and politician on complaint trends, team performance, and ward-level patterns.

**Dashboards:**
- Monthly complaint volume trend (line chart)
- Category breakdown this month vs last month (grouped bar)
- Average resolution time by category (horizontal bar)
- Team performance table (tickets assigned, resolved, avg time, SLA breaches)
- Ward heatmap (interactive Leaflet map)
- Top 10 recurring complaint tags (word cloud or bar chart)

**Export:**
- "Export Report" button generates a PDF summary using jsPDF
- Monthly report can be emailed to politician automatically (APScheduler, first of each month)

---

## 8. Data Models

### complaints

```sql
CREATE TABLE complaints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id       VARCHAR(20) UNIQUE NOT NULL,        -- CMP-202602-00047
    citizen_name    VARCHAR(100),
    citizen_phone   VARCHAR(15) NOT NULL,
    channel         VARCHAR(20) NOT NULL,               -- web, whatsapp, voice
    raw_text        TEXT NOT NULL,
    photo_url       TEXT,
    voice_url       TEXT,
    category        VARCHAR(50) DEFAULT 'Unclassified',
    subcategory     VARCHAR(100),
    priority        INTEGER DEFAULT 3,                  -- 1-5
    priority_reason TEXT,
    summary         TEXT,
    status          VARCHAR(30) DEFAULT 'New',          -- New, Acknowledged, In Progress, Resolved, Closed, Escalated
    assigned_to     UUID REFERENCES users(id),
    ward_id         UUID REFERENCES wards(id),
    constituency_id UUID REFERENCES constituencies(id) NOT NULL,
    language        VARCHAR(30) DEFAULT 'Hindi',
    tags            TEXT[],
    ai_draft_reply  TEXT,
    resolution_note TEXT,
    sla_deadline    TIMESTAMPTZ,
    is_sla_breached BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    closed_at       TIMESTAMPTZ
);

CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority DESC);
CREATE INDEX idx_complaints_ward ON complaints(ward_id);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_complaints_fts ON complaints USING gin(to_tsvector('english', raw_text));
```

### users

```sql
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) NOT NULL,
    phone             VARCHAR(15) UNIQUE NOT NULL,
    email             VARCHAR(255) UNIQUE,
    role              VARCHAR(30) NOT NULL,             -- Politician, PA, FieldWorker, Coordinator
    constituency_id   UUID REFERENCES constituencies(id),
    language_pref     VARCHAR(30) DEFAULT 'Hindi',
    is_active         BOOLEAN DEFAULT TRUE,
    hashed_password   TEXT NOT NULL,
    last_login        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### complaint_history

```sql
CREATE TABLE complaint_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID REFERENCES complaints(id) ON DELETE CASCADE,
    old_status      VARCHAR(30),
    new_status      VARCHAR(30),
    changed_by      UUID REFERENCES users(id),
    note            TEXT,
    action_type     VARCHAR(50),                       -- status_change, note_added, reassigned, sms_sent, escalated
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### wards

```sql
CREATE TABLE wards (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_name       VARCHAR(100) NOT NULL,
    ward_number     INTEGER,
    constituency_id UUID REFERENCES constituencies(id),
    geojson         JSONB,                             -- Ward boundary polygon
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### constituencies

```sql
CREATE TABLE constituencies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    state           VARCHAR(100),
    type            VARCHAR(30),                       -- Lok Sabha, Vidhan Sabha, Municipal
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### briefings

```sql
CREATE TABLE briefings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id UUID REFERENCES constituencies(id),
    date            DATE NOT NULL,
    stats_snapshot  JSONB,                             -- Raw stats used to generate briefing
    ai_summary      TEXT,                              -- Claude-generated narrative summary
    trend_alert     TEXT,                              -- Claude-generated trend alert text
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### sms_log

```sql
CREATE TABLE sms_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID REFERENCES complaints(id),
    to_phone        VARCHAR(15) NOT NULL,
    message         TEXT NOT NULL,
    provider        VARCHAR(30) DEFAULT 'MSG91',
    status          VARCHAR(20),                       -- sent, delivered, failed
    provider_msg_id VARCHAR(100),
    sent_at         TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. API Contracts

### Authentication

```
POST /api/v1/auth/login
Body: { phone: string, password: string }
Response: { access_token: string, token_type: "bearer", user: UserSchema }

POST /api/v1/auth/refresh
Headers: Authorization: Bearer <token>
Response: { access_token: string }
```

### Complaints

```
POST /api/v1/complaints
Body: ComplaintCreateSchema
Response: { ticket_id: string, complaint: ComplaintSchema }
Auth: Public (no token required for web form submission)

GET /api/v1/complaints
Query Params: status, category, assigned_to, ward_id, priority, from_date, to_date, search, page, limit
Response: { complaints: ComplaintSchema[], total: int, page: int }
Auth: Required (FieldWorker sees only assigned, PA/Politician sees all)

GET /api/v1/complaints/{ticket_id}
Response: { complaint: ComplaintSchema, history: HistorySchema[] }
Auth: Required

PATCH /api/v1/complaints/{ticket_id}
Body: { status?, assigned_to?, priority?, note? }
Response: { complaint: ComplaintSchema }
Auth: Required

POST /api/v1/complaints/{ticket_id}/send-reply
Body: { message: string }
Response: { sms_log: SMSLogSchema }
Auth: PA, Politician roles only
```

### AI Co-Pilot

```
POST /api/v1/copilot/chat
Body: { message: string, history: ChatMessage[], query_type: "data" | "speech" | "media" | "reply" }
Response: Streaming text/event-stream
Auth: Politician role only

GET /api/v1/copilot/briefing/today
Response: { briefing: BriefingSchema, stats: StatsSchema }
Auth: Politician, PA roles

POST /api/v1/copilot/briefing/generate
Response: { briefing: BriefingSchema }
Auth: Admin only (also called by Celery scheduler)
```

### Analytics

```
GET /api/v1/analytics/summary
Query Params: from_date, to_date, constituency_id
Response: { total, open, resolved, avg_resolution_hours, by_category, by_status, by_ward }
Auth: PA, Politician roles

GET /api/v1/analytics/heatmap
Response: { wards: [{ ward_id, ward_name, geojson, complaint_count, top_category }] }
Auth: PA, Politician roles
```

### WhatsApp Webhook

```
POST /api/v1/webhooks/whatsapp
Body: Twilio webhook payload
Response: TwiML XML response
Auth: Twilio signature validation (X-Twilio-Signature header)
```

---

## 10. Non-Functional Requirements

### Performance
- Dashboard initial load: under 2 seconds (P95)
- AI classification completion: under 5 seconds per complaint
- API response time: under 300ms for all non-AI endpoints (P95)
- WebSocket connection: real-time updates within 500ms of server event

### Scalability
- Handle 1,000 concurrent dashboard users without degradation
- Handle 10,000 complaint records per constituency without query degradation (addressed by indexes)
- Celery workers can scale horizontally — deploy multiple workers on Railway for higher throughput
- Redis queue handles burst intake of 500 complaints in 10 minutes without loss

### Reliability
- 99.5% uptime target
- Redis queue ensures no complaint is lost if AI service is temporarily down
- Celery task retry: 3 retries with exponential backoff on AI API failures
- All external API calls (Claude, Bhashini, Twilio) wrapped in try/except with graceful degradation

### Accessibility
- Web form and dashboard fully usable on mobile browsers (iOS Safari, Chrome Android)
- WhatsApp bot supports Hindi, English, and 2+ regional languages (Bhashini NMT)
- Dashboard passes WCAG 2.1 AA color contrast standards
- All form fields have proper ARIA labels

---

## 11. Security & Compliance

### Authentication & Authorization
- JWT tokens with 24-hour expiry, refresh tokens with 7-day expiry
- Passwords hashed with bcrypt (cost factor 12)
- Four RBAC roles: FieldWorker, PA, Politician, SuperAdmin — each with defined permission sets
- FieldWorkers can only see tickets assigned to them
- All role checks enforced on the backend, never client-side only

### Data Security
- All citizen data encrypted at rest (Supabase handles AES-256 at DB level)
- All API communication over HTTPS (TLS 1.3)
- Voice recordings stored in private Cloudflare R2 bucket (presigned URLs, expire in 1 hour)
- No plaintext passwords, tokens, or API keys stored in database

### API Security
- Rate limiting on all endpoints: 100 req/min per IP for public endpoints, 500 req/min for authenticated
- Rate limiting via Redis token bucket (slowapi library)
- Twilio webhook signature validated on every WhatsApp callback
- Input sanitization on all text fields (prevent SQL injection, XSS)
- CORS configured to allow only known frontend domains

### Secrets Management
- All API keys in environment variables, never in code
- `.env` files in `.gitignore`
- Railway and Vercel environment variable managers for production
- Rotate all API keys before going live

---

## 12. Out of Scope (v1.0)

The following are documented for v2 and beyond:

- Native mobile app (iOS/Android) — v1 is mobile-responsive web only
- Aadhaar-based citizen identity verification
- Video complaint submission
- Integration with CPGRAMS or state government portals
- Automated voice call handling (IVR) — v1 requires staff to upload recordings manually
- Payment or fund tracking for development projects
- Public-facing transparency portal for citizens to see aggregate statistics
- Multi-constituency management from one account
- AI-powered predictive analytics (predicting where complaints will spike)
- Offline mode for field workers in low-connectivity areas

---

## 13. Success Metrics

| Metric | Baseline (Current) | Target (3 Months Post-Launch) |
|---|---|---|
| Average grievance resolution time | 15–30 days | Under 5 days |
| AI classification accuracy | N/A | 85%+ |
| Complaints lost/forgotten per month | Unknown (10-20 estimated) | 0 |
| Politician daily time on constituency management | 60+ minutes | Under 15 minutes |
| Citizen satisfaction (post-resolution SMS survey) | N/A | 4/5 or above |
| Staff time spent on complaint intake/routing | 3 hours/day | Under 30 minutes/day |
| SLA breach rate | Unknown | Under 15% |
| WhatsApp bot complaint submission rate | 0% | 40%+ of total volume |

---

## 14. 14-Day Development Timeline

### Team Assumption: 2–3 developers working full-time (8 hrs/day)

---

### 🔴 Week 1: Foundation & Core (Days 1–7)

---

**Day 1 — Project Setup & Infrastructure**

Morning:
- Initialize monorepo with `/frontend` (React + Vite + TypeScript) and `/backend` (FastAPI) folders
- Set up `docker-compose.yml` with PostgreSQL + Redis for local development
- Configure Supabase project (hosted PostgreSQL), get connection string
- Set up Upstash Redis account, get connection URL
- Configure environment variables (`.env.example` with all keys documented)

Afternoon:
- Write all database migration files with Alembic (`alembic init`, create all 6 tables)
- Run migrations on Supabase
- Set up FastAPI app structure: `main.py`, `routers/`, `models/`, `schemas/`, `services/`, `utils/`
- Configure CORS, middleware, and health check endpoint (`GET /health`)
- Deploy backend to Railway (hello world) — confirm it's live

**Deliverable:** Monorepo initialized, database schema live on Supabase, backend deployed and accessible at Railway URL.

---

**Day 2 — Authentication System**

Morning:
- Build User model, UserSchema (Pydantic), and database CRUD functions
- Implement `POST /api/v1/auth/login` with JWT generation
- Implement JWT middleware (dependency injection pattern in FastAPI)
- Implement RBAC permission decorators (`require_role(["PA", "Politician"])`)

Afternoon:
- Build React frontend skeleton: Vite + TypeScript + Tailwind + shadcn/ui setup
- Build Login page (phone + password form)
- Implement Axios instance with JWT interceptor (auto-attach token, auto-refresh on 401)
- Implement React Router with route guards (redirect to login if not authenticated, redirect to 403 if wrong role)
- Test full auth flow end-to-end

**Deliverable:** Working login system with role-based route protection.

---

**Day 3 — Complaint Intake (Web Form + Database)**

Morning:
- Build `POST /api/v1/complaints` endpoint
  - Accept complaint data, generate ticket ID, insert to DB
  - Push complaint ID to Redis queue for async AI processing
  - Return ticket ID immediately (don't wait for AI)
- Build `GET /api/v1/complaints` with filtering, pagination, full-text search
- Build `GET /api/v1/complaints/{ticket_id}` with history

Afternoon:
- Build public-facing Complaint Submission Form (React)
  - Name, phone, ward, description, category (optional), photo upload
  - English/Hindi toggle (static translation strings, no i18n library needed for v1)
  - Submit → show success screen with ticket ID
  - Form validation with React Hook Form + Zod
- Test end-to-end: submit form → confirm ticket in Supabase

**Deliverable:** Citizens can submit complaints via web form. Tickets appear in database.

---

**Day 4 — AI Classification Engine (Core Intelligence)**

Morning:
- Set up Celery worker with Redis broker (`celery_app.py`)
- Write `classify_complaint` Celery task:
  - Pull complaint from queue
  - Build Claude API prompt with complaint text + taxonomy + rules
  - Call Claude API (`claude-sonnet-4-6`) with JSON mode enforcement
  - Parse response, validate against expected schema
  - Update complaint record with AI fields (category, priority, summary, tags, draft_reply)
  - On failure: retry 3 times → if all fail, set category to "Unclassified", notify PA
- Start Celery worker locally, test with a sample complaint

Afternoon:
- Add auto-assignment logic: after classification, match category + priority to team member using rules
  - Build `assignment_rules` config (JSON/DB table): category → preferred role
  - Assign to least-loaded team member with matching role
- Set SLA deadline based on category (configurable constants in `config.py`)
- Test full pipeline: complaint submitted → classified → assigned → SLA set — all within 5 seconds

**Deliverable:** Every new complaint is automatically classified, prioritized, assigned, and SLA-stamped by AI within 5 seconds.

---

**Day 5 — Staff CRM Dashboard (Inbox & Ticket Detail)**

Morning:
- Build main CRM layout in React: sidebar navigation, top bar, main content area
- Build Inbox View:
  - Fetch complaints from API with pagination
  - Render complaint list with priority color-coding, status pills, SLA countdown
  - Filter bar (category, status, assignee, date range) — each filter triggers API call with query params
  - Search bar with 300ms debounce

Afternoon:
- Build Ticket Detail Slide-Over panel (opens on clicking any complaint row):
  - Citizen info section
  - AI summary and tags section
  - Editable fields: Status dropdown, Assignee dropdown, Priority
  - Activity log (complaint_history records)
  - Notes input (adds to history with `note_added` action type)
  - "Send Reply" button (opens modal with AI draft pre-filled, staff edits then confirms)
  - On any change → PATCH complaint API → optimistic UI update
- Test all interactions

**Deliverable:** Full staff dashboard with inbox, filters, and ticket detail panel working.

---

**Day 6 — WhatsApp Bot + SMS Notifications**

Morning:
- Set up Twilio account, get WhatsApp Sandbox number
- Build `POST /api/v1/webhooks/whatsapp` endpoint with Twilio signature validation
- Implement WhatsApp conversation state machine (stored in Redis per phone number):
  - State 0: Greeting, ask name
  - State 1: Ask ward/area
  - State 2: Ask complaint description
  - State 3: Ask for photo (optional, skip allowed)
  - State 4: Confirm and create ticket, send ticket ID
  - State "status": If user sends a ticket ID, return current status
- Test bot end-to-end with Twilio sandbox

Afternoon:
- Set up MSG91 account (get API key, sender ID, DLT registration for production — use test mode for now)
- Build `send_sms` utility function wrapping MSG91 API
- Trigger SMS on events:
  - Complaint created → acknowledgment SMS
  - Ticket resolved → resolution SMS with action taken
  - SLA breached → SMS to PA and assignee
- Build Celery Beat schedule: SLA breach checker runs every 15 minutes
- Test all SMS triggers

**Deliverable:** WhatsApp bot works end-to-end. SMS notifications fire on all key events.

---

**Day 7 — AI Co-Pilot: Morning Briefing**

Morning:
- Build database queries for briefing stats:
  - Total open, new since yesterday, resolved today, SLA breaches
  - Category breakdown (this month vs last month)
  - Priority 5 tickets open
  - Ward complaint counts
  - Trend detection: categories up/down >25% vs last week
- Build `generate_briefing` Celery task:
  - Collect all stats into a structured dict
  - Pass to Claude with briefing generation prompt
  - Save to `briefings` table
- Set APScheduler to trigger at 7:00 AM daily

Afternoon:
- Build AI Co-Pilot React page (politician route-guarded)
- Morning Briefing UI:
  - Stats cards (open, new, resolved, breaches)
  - Urgent cases panel (top 5 priority tickets)
  - Category breakdown donut chart (Recharts)
  - Ward heatmap (Leaflet.js with ward GeoJSON)
  - AI trend alert text
- Fetch from `GET /api/v1/copilot/briefing/today`
- Add "Refresh Briefing" button for manual regeneration

**Deliverable:** Politician sees a fully auto-generated morning briefing with stats, charts, and heatmap.

---

### 🟡 Week 2: Co-Pilot, Polish & Deploy (Days 8–14)

---

**Day 8 — AI Co-Pilot: Conversational Panel**

Morning:
- Build `POST /api/v1/copilot/chat` endpoint with streaming response
  - Detect query type from message (data / speech / media)
  - For data queries: run relevant DB query first, pass results as context to Claude
  - For speech/media: pass last 30 days of resolved stats + constituent profile to Claude
  - Stream Claude response back to frontend using Server-Sent Events (SSE)
- Build Claude system prompt for Co-Pilot persona (data-aware constituency assistant)

Afternoon:
- Build chat UI in React:
  - Message bubbles (user right, AI left)
  - Streaming text display (character by character as SSE events arrive)
  - Input box + send button + suggested quick-action chips ("Morning Summary", "Draft Speech", "Show SLA Breaches")
  - "Copy" button on every AI response
  - Loading indicator while streaming
- Test 10 different query types

**Deliverable:** Politician can have a full conversation with their constituency data via AI Co-Pilot.

---

**Day 9 — Analytics Dashboard**

Morning:
- Build analytics API endpoints:
  - `GET /api/v1/analytics/summary` — aggregate stats with date range filter
  - `GET /api/v1/analytics/heatmap` — ward-level complaint counts + top categories with GeoJSON
  - `GET /api/v1/analytics/team` — per-user performance stats
- Ensure queries are efficient (use the indexes set on Day 1)

Afternoon:
- Build Analytics page in React (accessible to PA and Politician):
  - Monthly complaint volume trend — Recharts LineChart
  - Category comparison (this month vs last) — Recharts BarChart
  - Average resolution time by category — Recharts BarChart horizontal
  - Team performance table (sortable)
  - Ward heatmap (reuse from Co-Pilot briefing, but with interactivity — click ward to filter inbox)
- Connect all charts to real API data

**Deliverable:** Full analytics dashboard with all charts powered by live data.

---

**Day 10 — Team Management, SLA, & Field Worker Mobile View**

Morning:
- Build Team Management page (PA only):
  - Add/edit team members
  - Set role and ward assignments
  - View workload per team member
  - Configure SLA deadlines per category
- Build SLA Tracker view (dedicated tab showing only breached/near-breach tickets)

Afternoon:
- Build mobile-optimized Field Worker view:
  - Simple list of assigned tickets only
  - Each ticket shows: category, citizen name, ward, summary, status
  - Big status update buttons (In Progress → Resolved) with mandatory resolution note
  - Hindi UI option (toggle in settings)
  - Tested on actual mobile browser (Chrome Android)

**Deliverable:** Field workers can manage their tasks from mobile. PA can configure team and SLAs.

---

**Day 11 — Voice Call Transcription Pipeline**

Morning:
- Build voice upload endpoint: `POST /api/v1/complaints/voice-upload`
  - Accept audio file (MP3/WAV/WebM/OGG)
  - Upload to Cloudflare R2
  - Convert to WAV if needed using FFmpeg (`subprocess` call)
  - Send to Bhashini ASR API with language selection
  - Return transcription text + detected language
  - Fallback to Whisper API if Bhashini fails

Afternoon:
- Build Voice Upload UI in Staff Dashboard:
  - Upload button in the "New Complaint" form
  - Language selector (Hindi, Tamil, Telugu, Bengali, English, Hinglish)
  - Shows transcription result for staff review
  - Staff can edit transcription before confirming
  - On confirm: creates ticket from transcription text
- Test with real audio samples in Hindi and English
- Handle Bhashini Base64/WAV format requirement

**Deliverable:** Staff can upload a voice recording and create a complaint from the transcription.

---

**Day 12 — Testing, Bug Fixes & Edge Cases**

Full day dedicated to quality:

Morning:
- Write pytest test suite for backend:
  - Auth flow (login, token expiry, role enforcement)
  - Complaint creation and AI classification pipeline
  - SLA breach detection
  - WhatsApp webhook handler
  - All API endpoints with mock data
- Run tests, fix failures

Afternoon:
- Frontend QA pass:
  - Test every user flow for all 4 personas
  - Test on mobile (Chrome Android + iOS Safari)
  - Test with 100 complaint records in database (seed data script)
  - Fix all UI bugs found
  - Verify all error states show appropriate messages (not blank screens)
  - Test AI Co-Pilot with 15 different query types

**Deliverable:** 80%+ test coverage on backend. All major user flows verified bug-free.

---

**Day 13 — Security Hardening & Performance**

Morning:
- Security audit checklist:
  - Rate limiting active on all endpoints (verify with load test)
  - All secrets in environment variables (audit codebase with `git grep`)
  - SQL injection test (try malicious inputs through all forms)
  - XSS test (try script injection in all text fields)
  - JWT expiry working correctly
  - CORS only allowing known frontend domain
  - Twilio webhook signature validation working
  - Cloudflare R2 bucket is private (test direct URL access — should fail)

Afternoon:
- Performance optimization:
  - Add Redis caching to analytics endpoints (5-minute TTL)
  - Lazy-load Leaflet map (it's large, don't block initial render)
  - Add database query `EXPLAIN ANALYZE` for slow queries, add missing indexes
  - Lighthouse audit on frontend — target 85+ score
  - Test dashboard with 1000 complaint records — verify page loads under 2 seconds

**Deliverable:** Platform passes security checklist and performance targets.

---

**Day 14 — Final Deployment, Documentation & Demo Prep**

Morning:
- Production deployment:
  - Set all production environment variables on Railway (backend) and Vercel (frontend)
  - Run Alembic migrations on production Supabase
  - Configure custom domain on Vercel (if available)
  - Set up GitHub Actions CI/CD: lint → test → deploy on push to main
  - Seed production database with demo data (3 constituencies, 10 users, 200 complaints across statuses)
  - Test full production flow end-to-end

Afternoon:
- Documentation:
  - Update `README.md` with setup instructions, environment variables, and deployment guide
  - Document all API endpoints (FastAPI auto-docs available at `/docs`)
  - Record a 3-minute demo video walkthrough covering all 4 personas
  - Prepare demo script for live presentation:
    - Citizen submits complaint via web form (30 seconds)
    - Staff sees it classified and assigned automatically (30 seconds)
    - Staff resolves and sends reply (30 seconds)
    - Politician views morning briefing (30 seconds)
    - Politician asks Co-Pilot "Draft a speech for tomorrow's event" (30 seconds)

**Deliverable:** Platform live in production. README complete. Demo ready.

---

### Timeline Summary

| Phase | Days | Focus |
|---|---|---|
| Foundation | Days 1–2 | Infrastructure, Auth, Setup |
| Core CRM | Days 3–6 | Intake, AI Engine, Dashboard, WhatsApp, SMS |
| AI Co-Pilot | Days 7–8 | Briefing, Conversational Panel |
| Polish | Days 9–11 | Analytics, Mobile View, Voice Pipeline |
| QA & Launch | Days 12–14 | Testing, Security, Deploy, Demo |

---

## 15. MVP Definition

For a hackathon or initial demo, the absolute minimum to demonstrate the full value proposition:

1. **Web complaint submission form** — citizen submits complaint with name, phone, description
2. **AI auto-classification** — Claude classifies category, priority, and generates summary within 5 seconds
3. **Staff CRM dashboard** — inbox with ticket list, ticket detail with status update
4. **AI draft reply** — one-click to see Claude's suggested reply to citizen
5. **AI Co-Pilot chat panel** — conversational interface answering at least 3 query types (summary, speech, SLA status)
6. **SMS notification** — Twilio SMS to citizen on ticket creation (test mode is fine for demo)

Everything else is impressive but the above 6 constitute a complete, demonstrable product loop.

---

## 16. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bhashini API instability or rejection | High | High | Always implement Whisper as fallback first; test Bhashini before relying on it |
| Claude API rate limits hit during demo | Medium | High | Cache Co-Pilot responses; use streaming; have fallback canned responses for demo |
| WhatsApp Sandbox limitations | High | Medium | Use Sandbox for dev/demo only; document WATI production path |
| Ward-level GeoJSON data unavailable | Medium | Medium | Use district-level GeoJSON from Bhuvan as fallback; hardcode for demo constituency |
| MSG91 DLT registration delay | High | Medium | Use Twilio SMS as fallback; DLT is only needed for production in India |
| Railway/Vercel cold starts slowing demo | Low | High | Use paid Railway plan ($5/month) to avoid cold starts during demo |
| Celery worker crashes losing complaints | Low | High | Redis queue persists jobs; Celery auto-restarts with supervisor; implement dead-letter queue |
| Team falls behind on Day 4 (AI engine) | Medium | High | AI engine is the critical path; allocate best developer to it; have simple rule-based fallback ready |

---

*This PRD is the single source of truth for the P-CRM + AI Co-Pilot project. All feature decisions, technical choices, and timeline commitments are documented here. Update this document whenever scope changes.*

---

