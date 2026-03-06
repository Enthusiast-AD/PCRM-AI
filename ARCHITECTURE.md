# Architecture Diagram & Connection Map

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        P-CRM SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (React + TypeScript)         BACKEND (FastAPI)       │
│  http://localhost:8080                 http://localhost:8000   │
│                                                                 │
│  ┌──────────────────────────┐         ┌──────────────────────┐ │
│  │   React Components        │         │   FastAPI Routes     │ │
│  │                           │         │                      │ │
│  │ ┌────────────────────┐   │         │ ┌──────────────────┐ │ │
│  │ │   Login Page       │   │  ────→  │ │  /api/v1/auth    │ │ │
│  │ └────────────────────┘   │  POST   │ ├──────────────────┤ │ │
│  │                           │ login   │ │ - login          │ │ │
│  │ ┌────────────────────┐   │ register│ │ - register       │ │ │
│  │ │  Dashboard         │   │  ────→  │ └──────────────────┘ │ │
│  │ │  - Politician      │   │  GET    │                      │ │
│  │ │  - Worker          │   │  POST   │ ┌──────────────────┐ │ │
│  │ └────────────────────┘   │  ────→  │ │  /api/v1/         │ │
│  │                           │         │ │  complaints      │ │
│  │ ┌────────────────────┐   │  GET    │ ├──────────────────┤ │ │
│  │ │  Analytics         │   │  ────→  │ │ - create         │ │
│  │ │  - Summary         │   │  GET    │ │ - list           │ │
│  │ │  - Heatmap         │   │         │ │ - public         │ │
│  │ └────────────────────┘   │         │ │ - detail (TODO)  │ │
│  │                           │         │ │ - update (TODO)  │ │
│  │ ┌────────────────────┐   │         │ └──────────────────┘ │ │
│  │ │  AI Copilot        │   │  POST   │                      │ │
│  │ │  - Chat            │   │  ────→  │ ┌──────────────────┐ │ │
│  │ │  - Briefing        │   │  GET    │ │  /api/v1/        │ │
│  │ └────────────────────┘   │         │ │  analytics       │ │
│  │                           │        │ │ ├──────────────────┤│ │
│  │ ┌────────────────────┐   │  GET   │ │ │ - summary       ││ │
│  │ │  Complaint Form    │   │  ────→  │ │ - heatmap       ││ │
│  │ │  (Public)          │   │  POST   │ │                 ││ │
│  │ └────────────────────┘   │         │ └──────────────────┘ │ │
│  │                           │         │                      │ │
│  └──────────────────────────┘         │ ┌──────────────────┐ │ │
│                    ↓                   │ │  /api/v1/        │ │
│  ┌──────────────────────────┐         │ │  copilot         │ │
│  │   API Client Service     │         │ ├──────────────────┤ │ │
│  │   (apiClient.ts)         │         │ │ - chat           │ │
│  │                           │         │ │ - briefing       │ │
│  │ Methods:                 │         │ └──────────────────┘ │ │
│  │ • login()                │         │                      │ │
│  │ • register()             │         │ ┌──────────────────┐ │ │
│  │ • getComplaints()        │         │ │  /api/v1/        │ │
│  │ • createComplaint()      │ ────→  │ │  webhooks        │ │
│  │ • getAnalyticsSummary()  │         │ ├──────────────────┤ │ │
│  │ • getHeatmapData()       │         │ │ - whatsapp       │ │
│  │ • sendCopilotMessage()   │         │ └──────────────────┘ │ │
│  │ • getTodayBriefing()     │         │                      │ │
│  │ • healthCheck()          │         │ ┌──────────────────┐ │ │
│  │                           │         │ │  /health         │ │
│  └──────────────────────────┘         │ └──────────────────┘ │ │
│            ↓                           │                      │ │
│  ┌──────────────────────────┐         ├──────────────────────┤ │
│  │  localStorage            │         │    Database Layer    │ │
│  │  • auth_token            │         │  (SQLAlchemy ORM)    │ │
│  │  • auth_user             │         │                      │ │
│  │                           │         │ Models:              │ │
│  └──────────────────────────┘         │ • User              │ │
│                                        │ • Complaint         │ │
│                                        │ • Constituency      │ │
│                                        │ • Ward              │ │
│                                        │ • Briefing          │ │
│                                        │ • SMS Log           │ │
│                                        │ • History           │ │
│                                        │                      │ │
│                                        └──────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Request Flow with Authentication

```
┌──────────────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  USER ACTION (e.g., Click "Get Complaints")                          │
│         ↓                                                             │
│  Component calls apiClient.getComplaints()                           │
│         ↓                                                             │
│  apiClient.request('/api/v1/complaints', 'GET')                     │
│         ↓                                                             │
│  ┌─────────────────────────────────────────┐                        │
│  │  Get Headers:                           │                        │
│  │  1. token = localStorage.getItem(       │                        │
│  │     'auth_token')                       │                        │
│  │  2. If token exists:                    │                        │
│  │     Authorization: Bearer {token}       │                        │
│  └─────────────────────────────────────────┘                        │
│         ↓                                                             │
│  HTTP GET http://localhost:8000/api/v1/complaints                   │
│  Headers: {                                                          │
│    'Content-Type': 'application/json',                               │
│    'Authorization': 'Bearer eyJ...'  (if logged in)                 │
│  }                                                                    │
│         ↓                                                             │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │           BACKEND                                       │        │
│  │                                                         │        │
│  │  1. Receive request                                   │        │
│  │  2. Extract token from Authorization header          │        │
│  │  3. Validate token (JWT)                             │        │
│  │  4. Get user from token                              │        │
│  │  5. Check user role                                  │        │
│  │  6. Query database based on role:                    │        │
│  │     - PA/Politician: All complaints                  │        │
│  │     - FieldWorker: Only assigned                     │        │
│  │  7. Return JSON response                             │        │
│  │                                                         │        │
│  └─────────────────────────────────────────────────────────┘        │
│         ↓                                                             │
│  HTTP 200 OK                                                         │
│  Response Body: [{ complaint }, { complaint }, ...]                 │
│         ↓                                                             │
│  apiClient parses response                                           │
│         ↓                                                             │
│  Returns { data: [...], status: 200 }                                │
│         ↓                                                             │
│  Component updates state with data                                   │
│         ↓                                                             │
│  UI re-renders with complaint list                                   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Login Process

```
┌──────────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  STEP 1: USER ENTERS CREDENTIALS                                    │
│  ┌─────────────────────────────────────┐                            │
│  │ Login.tsx                           │                            │
│  │ • username = "9876543210"           │                            │
│  │ • password = "password123"          │                            │
│  │ • [Submit] button clicked           │                            │
│  └─────────────────────────────────────┘                            │
│         ↓                                                             │
│  STEP 2: COMPONENT CALLS AUTH CONTEXT                               │
│  ┌─────────────────────────────────────┐                            │
│  │ const { login } = useAuth()         │                            │
│  │ await login(username, password)     │                            │
│  └─────────────────────────────────────┘                            │
│         ↓                                                             │
│  STEP 3: AUTH CONTEXT CALLS API CLIENT                              │
│  ┌─────────────────────────────────────┐                            │
│  │ AuthContext.login()                 │                            │
│  │ • Calls apiClient.login(u, p)       │                            │
│  │ • Sets loading = true               │                            │
│  │ • Clears error                      │                            │
│  └─────────────────────────────────────┘                            │
│         ↓                                                             │
│  STEP 4: API CLIENT SENDS REQUEST                                   │
│  ┌─────────────────────────────────────┐                            │
│  │ apiClient.login()                   │                            │
│  │ • Creates FormData                  │                            │
│  │ • username, password                │                            │
│  │ • POST /api/v1/auth/login           │                            │
│  └─────────────────────────────────────┘                            │
│         ↓                                                             │
│  STEP 5: BACKEND VALIDATES                                          │
│  ┌─────────────────────────────────────┐                            │
│  │ Backend (auth.py)                   │                            │
│  │ • Query user by phone/email         │                            │
│  │ • Verify password hash              │                            │
│  │ • Generate JWT token                │                            │
│  │ • Return {                          │                            │
│  │   access_token,                     │                            │
│  │   token_type: "bearer",             │                            │
│  │   user: {id, name, role, ...}       │                            │
│  │ }                                   │                            │
│  └─────────────────────────────────────┘                            │
│         ↓                                                             │
│  STEP 6: AUTH CONTEXT PROCESSES RESPONSE                            │
│  ┌─────────────────────────────────────┐                            │
│  │ AuthContext.login()                 │                            │
│  │ • Extract response.access_token     │                            │
│  │ • Map role: "Politician" → "politician"                          │
│  │ • Create userData object            │                            │
│  │ • setUser(userData)                 │                            │
│  │ • Store token in localStorage       │                            │
│  │ • Store user in localStorage        │                            │
│  │ • Return true                       │                            │
│  └─────────────────────────────────────┘                            │
│         ↓                                                             │
│  STEP 7: LOGIN PAGE HANDLES SUCCESS                                 │
│  ┌─────────────────────────────────────┐                            │
│  │ Login.tsx                           │                            │
│  │ • success = true                    │                            │
│  │ • navigate('/politician/dashboard') │                            │
│  │ • setLoading(false)                 │                            │
│  └─────────────────────────────────────┘                            │
│         ↓                                                             │
│  STEP 8: USER REDIRECTED                                            │
│  ┌─────────────────────────────────────┐                            │
│  │ PoliticianDashboard page            │                            │
│  │ • useAuth() returns logged-in user  │                            │
│  │ • Components render with user data  │                            │
│  │ • API requests include token        │                            │
│  └─────────────────────────────────────┘                            │
│                                                                       │
│  localStorage state:                                                 │
│  ✓ auth_token: "eyJhbGciOi..."                                      │
│  ✓ auth_user: {"id":"...", "name":"...", "role":"politician"}      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Endpoint Connection Matrix

```
┌────────────────┬──────────────────────────────────────┬──────────────────────┐
│ Component      │ API Method                           │ Backend Endpoint     │
├────────────────┼──────────────────────────────────────┼──────────────────────┤
│ Login          │ apiClient.login()                    │ POST /auth/login     │
│                │ apiClient.register()                 │ POST /auth/register  │
├────────────────┼──────────────────────────────────────┼──────────────────────┤
│ Dashboard      │ apiClient.getComplaints()            │ GET /complaints      │
│ (Politician)   │ apiClient.getAnalyticsSummary()      │ GET /analytics/...   │
│                │ apiClient.getTodayBriefing()         │ GET /copilot/...     │
├────────────────┼──────────────────────────────────────┼──────────────────────┤
│ Dashboard      │ apiClient.getComplaints()            │ GET /complaints      │
│ (Worker)       │                                      │                      │
├────────────────┼──────────────────────────────────────┼──────────────────────┤
│ ComplaintForm  │ apiClient.createComplaint()          │ POST /complaints     │
│ (Public)       │                                      │                      │
├────────────────┼──────────────────────────────────────┼──────────────────────┤
│ Analytics      │ apiClient.getAnalyticsSummary()      │ GET /analytics/...   │
│                │ apiClient.getHeatmapData()           │ GET /analytics/...   │
├────────────────┼──────────────────────────────────────┼──────────────────────┤
│ ChatDrawer     │ apiClient.sendCopilotMessage()       │ POST /copilot/chat   │
│ (AI Copilot)   │ apiClient.getTodayBriefing()         │ GET /copilot/...     │
├────────────────┼──────────────────────────────────────┼──────────────────────┤
│ Public Listing │ apiClient.getPublicComplaints()      │ GET /complaints/...  │
└────────────────┴──────────────────────────────────────┴──────────────────────┘
```

---

## Token Flow & Authorization

```
Local Storage                     API Client                      Backend
┌─────────────────┐              ┌─────────────────┐             ┌──────────────┐
│  auth_token     │◄────────────┐│ getHeaders()    │             │   validate   │
│  auth_user      │  (on login) │└─────────────────┘             │   token()    │
└─────────────────┘              │   localStorage.              │              │
       ↑                         │   getItem()                   │  Extract role│
       │                         │                              │  from JWT    │
       │                         │   Inject into all            │              │
       │                         │   request headers:           │  Check role  │
       │                         │                              │  permissions │
       │                         │  Authorization: Bearer       │              │
       │                         │  <token>                     │  Return 401  │
       │                         │                              │  if invalid  │
       └──────(on logout)───────→└─────────────────────────────→└──────────────┘
         removeItem('auth_token')   (clear token from requests)    Deny access
         removeItem('auth_user')
```

---

## Environment & Configuration

```
Frontend Setup:
┌────────────────────────────────────────┐
│ .env (frontend/.env)                   │
│                                        │
│ VITE_API_URL=http://localhost:8000    │
│                                        │
│ Used by: apiClient.ts                 │
│ const API_BASE_URL =                   │
│   import.meta.env.VITE_API_URL ||      │
│   'http://localhost:8000'              │
└────────────────────────────────────────┘

Backend Setup:
┌────────────────────────────────────────┐
│ backend/.env (optional)                │
│                                        │
│ PORT=8000                              │
│ DATABASE_URL=sqlite:///./test.db       │
│ JWT_SECRET=your_secret_key             │
│                                        │
│ Run: uvicorn main:app --reload         │
└────────────────────────────────────────┘
```

---

## Error Handling Flow

```
API Request
    ↓
Response received
    ↓
Is response OK? (status 200-299)
    ├─ YES → Parse JSON
    │         ↓
    │         Return { data, status }
    │
    └─ NO → Backend returned error
             ↓
             Parse error.detail
             ↓
             Return { error, status }

Frontend Component
    ↓
if (response.error) {
    // Handle error
    setError(response.error)
    show ErrorMessage
} else {
    // Use data
    setState(response.data)
}
```

---

## Integration Checklist (Visual)

```
AUTHENTICATION ✅
├─ [✅] apiClient.login()
├─ [✅] apiClient.register()
├─ [✅] Token storage
├─ [✅] Token injection in headers
└─ [✅] Error handling

COMPLAINTS ⏳
├─ [✅] apiClient.createComplaint()
├─ [✅] apiClient.getComplaints()
├─ [✅] apiClient.getPublicComplaints()
├─ [⏳] Frontend component integration
├─ [❌] apiClient.getComplaintDetail() - Backend TODO
└─ [❌] apiClient.updateComplaint() - Backend TODO

ANALYTICS ⏳
├─ [✅] apiClient.getAnalyticsSummary()
├─ [✅] apiClient.getHeatmapData()
└─ [⏳] Frontend dashboard integration

COPILOT ⏳
├─ [✅] apiClient.sendCopilotMessage()
├─ [✅] apiClient.getTodayBriefing()
└─ [⏳] Frontend component integration

HEALTH ✅
└─ [✅] apiClient.healthCheck()

Legend: ✅ Complete | ⏳ In Progress | ❌ TODO
```

---

## Project Structure

```
PCRM-AI/
├── API_DOCUMENTATION.md ..................... Complete API reference ✅
├── INTEGRATION_GUIDE.md ..................... Step-by-step guide ✅
├── QUICK_REFERENCE.md ....................... Quick lookup ✅
├── INTEGRATION_SUMMARY.md ................... This document ✅
│
├── backend/ ................................. FastAPI server
│   ├── main.py .............................. Entry point
│   ├── config.py ............................ Settings
│   ├── celery_app.py ........................ Background tasks
│   ├── requirements.txt ..................... Python dependencies
│   ├── alembic/ ............................. Database migrations
│   ├── models/ .............................. SQLAlchemy models
│   │   ├── user.py
│   │   ├── complaint.py
│   │   ├── constituency.py
│   │   ├── ward.py
│   │   ├── briefing.py
│   │   ├── history.py
│   │   └── sms_log.py
│   ├── routers/ ............................. API endpoints
│   │   ├── auth.py ✅
│   │   ├── complaints.py ✅
│   │   ├── analytics.py ✅
│   │   ├── copilot.py ✅
│   │   └── webhooks.py ✅
│   ├── schemas/ ............................. Request/Response models
│   │   ├── user.py
│   │   ├── complaint.py
│   │   ├── analytics.py
│   │   └── copilot.py
│   ├── services/ ............................ Business logic
│   │   ├── ai_service.py
│   │   ├── auth_service.py
│   │   ├── sms_service.py
│   │   └── whatsapp_service.py
│   └── utils/ ............................... Utilities
│       ├── database.py
│       ├── dependencies.py
│       └── security.py
│
└── frontend/ ................................ React app
    ├── .env.example ......................... Environment template ✅
    ├── package.json ......................... Dependencies
    ├── vite.config.ts ....................... Build config
    ├── tsconfig.json ........................ TypeScript config
    │
    └── src/
        ├── main.tsx ......................... Entry point
        ├── App.tsx .......................... Router setup
        │
        ├── services/
        │   ├── apiClient.ts ✅ NEW ......... Centralized API client
        │   └── aiService.ts ✅ UPDATED .... AI service
        │
        ├── contexts/
        │   └── AuthContext.tsx ✅ UPDATED . Auth state management
        │
        ├── pages/
        │   ├── Login.tsx ✅ UPDATED ....... Real authentication
        │   ├── Index.tsx ..................... Home/public page
        │   ├── politician/
        │   │   ├── Dashboard.tsx
        │   │   ├── Analytics.tsx
        │   │   ├── ActiveWorks.tsx
        │   │   ├── Approvals.tsx
        │   │   ├── Workers.tsx
        │   │   ├── AssignWork.tsx
        │   │   └── Settings.tsx
        │   └── worker/
        │       ├── Dashboard.tsx
        │       └── TaskDetail.tsx
        │
        ├── components/
        │   ├── ai/
        │   │   ├── ChatDrawer.tsx
        │   │   ├── FloatingChatButton.tsx
        │   │   ├── AIInsightsCard.tsx
        │   │   ├── ApprovalAIReview.tsx
        │   │   └── ...
        │   ├── FileUpload.tsx
        │   ├── NavLink.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── StatCard.tsx
        │   ├── StatusBadge.tsx
        │   └── ui/ .......................... Shadcn UI components
        │
        ├── types/
        │   └── index.ts ..................... TypeScript types
        │
        ├── lib/
        │   └── utils.ts ..................... Utility functions
        │
        └── data/
            └── mock.ts ...................... Mock data for testing
```

---

## Success Criteria

✅ All 13 backend endpoints identified and documented
✅ Centralized API client created
✅ Authentication fully integrated
✅ Token management implemented
✅ Error handling patterns established
✅ Comprehensive documentation provided
✅ Integration examples provided
✅ Environment configuration ready

🎉 **Frontend is now ready to connect to all backend services!**
