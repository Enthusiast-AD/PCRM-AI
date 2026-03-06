# Quick API Reference

## All Backend Endpoints at a Glance

### 1. Health Check
```
GET /health
```
No auth required | Returns: `{"status": "ok"}`

---

### 2. Authentication

#### Login
```
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=phone_or_email&password=password
```
Returns: `access_token`, token_type, user details

#### Register
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "phone": "string",
  "email": "string",
  "name": "string",
  "password": "string",
  "role": "Politician|PA|FieldWorker",
  "constituency_id": "uuid?",
  "ward_id": "uuid?"
}
```

---

### 3. Complaints

#### Create (Public)
```
POST /api/v1/complaints
Content-Type: application/json

{
  "category": "string",
  "description": "string",
  "priority": 1-5,
  "citizen_phone": "string?",
  "channel": "web|whatsapp|sms?"
}
```

#### List (Auth Required)
```
GET /api/v1/complaints
Authorization: Bearer <token>
```
Returns role-filtered list

#### Public List (No Auth)
```
GET /api/v1/complaints/public
```

#### Details (Auth Required - TODO)
```
GET /api/v1/complaints/{id}
Authorization: Bearer <token>
```

#### Update (Auth Required - TODO)
```
PUT /api/v1/complaints/{id}
Authorization: Bearer <token>

{
  "status": "string",
  "priority": number?,
  "assigned_to": "uuid?"
}
```

---

### 4. Analytics (Auth Required - PA/Politician)

#### Summary
```
GET /api/v1/analytics/summary
Authorization: Bearer <token>
```
Returns: totals, open count, resolved count, by category/status/ward

#### Heatmap
```
GET /api/v1/analytics/heatmap
Authorization: Bearer <token>
```
Returns: Ward data with GeoJSON + complaint counts

---

### 5. Copilot (Auth Required - Politician)

#### Chat
```
POST /api/v1/copilot/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "string",
  "history": [{role, content}],
  "query_type": "data|speech|media|general"
}
```
Returns: `response` from AI

#### Morning Briefing (Auth Required - PA/Politician)
```
GET /api/v1/copilot/briefing/today
Authorization: Bearer <token>
```
Returns: briefing object with stats and AI summary

---

### 6. Webhooks (No Auth)

#### WhatsApp
```
POST /api/v1/webhooks/whatsapp
Content-Type: application/x-www-form-urlencoded

Body=message_text&From=whatsapp:phonenumber
```
Twilio webhook format

---

## Frontend Service Usage

```typescript
import { apiClient } from '@/services/apiClient';

// Auth
apiClient.login(username, password)
apiClient.register(userData)

// Complaints
apiClient.createComplaint(data)         // POST
apiClient.getComplaints()               // GET list
apiClient.getPublicComplaints()         // GET public
apiClient.getComplaintDetail(id)        // GET detail
apiClient.updateComplaint(id, data)     // PUT

// Analytics
apiClient.getAnalyticsSummary()         // GET summary
apiClient.getHeatmapData()              // GET heatmap

// Copilot
apiClient.sendCopilotMessage(msg, history, type)  // POST
apiClient.getTodayBriefing()            // GET

// Health
apiClient.healthCheck()                 // GET /health
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Environment Setup

**Frontend .env**
```
VITE_API_URL=http://localhost:8000
```

**Backend runs on**
```
http://localhost:8000
```

---

## Authentication Flow

1. User enters phone/email + password on Login page
2. Frontend calls `POST /api/v1/auth/login`
3. Backend returns `access_token` + user data
4. Frontend stores token in localStorage
5. All future requests include `Authorization: Bearer <token>`
6. On logout, token is cleared from localStorage

---

## Error Response Format

```json
{
  "detail": "Human readable error message"
}
```

---

## Role Permissions

| Role | Can Access |
|------|-----------|
| Politician | All authenticated endpoints except WhatsApp |
| PA | Analytics, Complaints, Briefing |
| FieldWorker | See own assigned complaints |
| Public | Submit complaints, view public complaints |

---

## Implementation Priority

### Phase 1 (Now)
- [x] Auth (Login/Register)
- [ ] Public Complaint Submission
- [ ] View Complaints List

### Phase 2
- [ ] Analytics Dashboard
- [ ] Complaint Status Updates
- [ ] Assignment Management

### Phase 3
- [ ] AI Copilot Chat
- [ ] Morning Briefing
- [ ] Heatmap Visualization

### Phase 4
- [ ] WhatsApp Integration UI
- [ ] Advanced Filtering
- [ ] Reporting

---

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Create complaint (public)
- [ ] View complaints list (authenticated)
- [ ] View analytics summary
- [ ] Send copilot message
- [ ] Get morning briefing
- [ ] Logout and verify token cleared
- [ ] Check API responses in network tab
- [ ] Verify error messages display

---

## Debugging Tips

1. **Check Console**: Browser DevTools → Console for JavaScript errors
2. **Network Tab**: Verify requests/responses
3. **Backend Logs**: Check terminal where backend is running
4. **Token**: `localStorage.getItem('auth_token')` in console
5. **User Data**: `localStorage.getItem('auth_user')` in console
6. **API URL**: `import.meta.env.VITE_API_URL` in console

---

## Common Commands

```bash
# Start backend
cd backend && python -m uvicorn main:app --reload

# Start frontend
cd frontend && npm run dev

# Test health
curl http://localhost:8000/health

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=9876543210&password=password"
```
