# P-CRM Backend API Documentation

**Base URL:** `http://localhost:8000`

## Overview
This document provides a complete list of all available API endpoints in the P-CRM backend and their usage patterns for frontend integration.

---

## 1. Authentication Endpoints
Base path: `/api/v1/auth`

### Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Description:** Authenticate user with phone/email and password
- **Request:**
  ```
  Content-Type: application/x-www-form-urlencoded
  
  username: string (phone number or email)
  password: string
  ```
- **Response:**
  ```json
  {
    "access_token": "string",
    "token_type": "bearer",
    "user": {
      "id": "uuid",
      "name": "string",
      "role": "Politician | PA | FieldWorker",
      "email": "string",
      "phone": "string"
    }
  }
  ```
- **Frontend Usage:**
  ```typescript
  import { apiClient } from '@/services/apiClient';
  const response = await apiClient.login(phoneOrEmail, password);
  localStorage.setItem('auth_token', response.access_token);
  ```

### Register
- **Endpoint:** `POST /api/v1/auth/register`
- **Description:** Create a new user account
- **Request:**
  ```json
  {
    "phone": "string (10-15 digits)",
    "email": "string",
    "name": "string",
    "password": "string",
    "role": "Politician | PA | FieldWorker",
    "constituency_id": "uuid (optional)",
    "ward_id": "uuid (optional)"
  }
  ```
- **Response:** Returns `UserResponse` object with created user details
- **Frontend Usage:**
  ```typescript
  const response = await apiClient.register(userData);
  ```

---

## 2. Complaints Endpoints
Base path: `/api/v1/complaints`

### Create Complaint
- **Endpoint:** `POST /api/v1/complaints`
- **Description:** Submit a new complaint (public endpoint, no auth required)
- **Request:**
  ```json
  {
    "citizen_phone": "string (optional)",
    "category": "string",
    "description": "string",
    "priority": number (1-5, optional),
    "ward_id": "uuid (optional)",
    "constituency_id": "uuid (optional)",
    "channel": "web | whatsapp | sms (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid",
    "ticket_id": "CMP-YYYYMM-XXXXX",
    "city_phone": "string",
    "category": "string",
    "description": "string",
    "priority": number,
    "status": "New",
    "created_at": "ISO8601 timestamp",
    "ward_id": "uuid",
    "constituency_id": "uuid"
  }
  ```
- **Frontend Usage:**
  ```typescript
  const complaint = await apiClient.createComplaint({
    category: 'Water Supply',
    description: 'No water for 3 days',
    priority: 5
  });
  ```

### Get Complaints
- **Endpoint:** `GET /api/v1/complaints`
- **Description:** Retrieve complaints (role-based filtering)
  - **Politician/PA:** All complaints in their constituency
  - **FieldWorker:** Only complaints assigned to them
- **Auth Required:** Yes (Bearer token)
- **Response:** Array of `ComplaintResponse` objects
- **Frontend Usage:**
  ```typescript
  const complaints = await apiClient.getComplaints();
  ```

### Get Public Complaints
- **Endpoint:** `GET /api/v1/complaints/public`
- **Description:** Retrieve complaints marked as `publishedToPublic = true`
- **Auth Required:** No
- **Response:** Array of public complaints
- **Frontend Usage:**
  ```typescript
  const publicComplaints = await apiClient.getPublicComplaints();
  ```

### Get Single Complaint (Not yet implemented in backend)
- **Endpoint:** `GET /api/v1/complaints/{complaint_id}`
- **Description:** Get details of a specific complaint
- **Auth Required:** Yes
- **Frontend Usage:**
  ```typescript
  const complaint = await apiClient.getComplaintDetail(complaintId);
  ```

### Update Complaint (Not yet implemented in backend)
- **Endpoint:** `PUT /api/v1/complaints/{complaint_id}`
- **Description:** Update complaint status, priority, or assignment
- **Auth Required:** Yes (PA or Politician only)
- **Request:**
  ```json
  {
    "status": "Acknowledged | In Progress | Resolved | Rejected",
    "priority": "number (1-5)",
    "assigned_to": "uuid (worker ID)",
    "notes": "string (internal notes)"
  }
  ```
- **Frontend Usage:**
  ```typescript
  await apiClient.updateComplaint(complaintId, {
    status: 'In Progress',
    assigned_to: workerId
  });
  ```

---

## 3. Analytics Endpoints
Base path: `/api/v1/analytics`

### Get Summary
- **Endpoint:** `GET /api/v1/analytics/summary`
- **Description:** Get constituency-level complaint statistics
- **Auth Required:** Yes (PA or Politician only)
- **Response:**
  ```json
  {
    "total": number,
    "open": number,
    "resolved": number,
    "avg_resolution_hours": number,
    "by_category": {
      "Water Supply": 15,
      "Road Maintenance": 8,
      ...
    },
    "by_status": {
      "New": 5,
      "In Progress": 12,
      "Resolved": 45,
      ...
    },
    "by_ward": {
      "Ward 1 - Central": 20,
      "Ward 2 - East": 18,
      ...
    }
  }
  ```
- **Frontend Usage:**
  ```typescript
  const summary = await apiClient.getAnalyticsSummary();
  ```

### Get Heatmap Data
- **Endpoint:** `GET /api/v1/analytics/heatmap`
- **Description:** Get ward-level complaint heatmap for visualization
- **Auth Required:** Yes (PA or Politician only)
- **Response:**
  ```json
  {
    "wards": [
      {
        "ward_id": "uuid",
        "ward_name": "Ward 1 - Central",
        "geojson": "string (GeoJSON format)",
        "complaint_count": number,
        "top_category": "Water Supply"
      },
      ...
    ]
  }
  ```
- **Frontend Usage:**
  ```typescript
  const heatmap = await apiClient.getHeatmapData();
  ```

---

## 4. Copilot Endpoints
Base path: `/api/v1/copilot`

### Chat with AI
- **Endpoint:** `POST /api/v1/copilot/chat`
- **Description:** Send message to AI copilot for intelligent assistance
- **Auth Required:** Yes (Politician only)
- **Request:**
  ```json
  {
    "message": "string",
    "history": [
      {
        "role": "user | assistant",
        "content": "string"
      }
    ],
    "query_type": "data | speech | media | general"
  }
  ```
  - **query_type:**
    - `data`: For data queries and statistics
    - `speech`: For speech/press release generation
    - `media`: For media/PR content
    - `general`: For general assistance
- **Response:**
  ```json
  {
    "response": "string (AI-generated response)"
  }
  ```
- **Frontend Usage:**
  ```typescript
  const response = await apiClient.sendCopilotMessage(
    "What are the urgent complaints?",
    chatHistory,
    "data"
  );
  ```

### Get Today's Briefing
- **Endpoint:** `GET /api/v1/copilot/briefing/today`
- **Description:** Get AI-generated morning briefing for the day
- **Auth Required:** Yes (PA or Politician)
- **Response:**
  ```json
  {
    "briefing": {
      "id": "uuid",
      "constituency_id": "uuid",
      "date": "YYYY-MM-DD",
      "stats_snapshot": {
        "total_open": number,
        "new_since_yesterday": number,
        "resolved_today": number,
        "sla_breaches": number
      },
      "ai_summary": "string",
      "trend_alert": "string",
      "created_at": "ISO8601 timestamp"
    },
    "stats": {
      "total_open": number,
      "new_since_yesterday": number,
      "resolved_today": number,
      "sla_breaches": number
    }
  }
  ```
- **Frontend Usage:**
  ```typescript
  const briefing = await apiClient.getTodayBriefing();
  ```

---

## 5. Webhooks Endpoints
Base path: `/api/v1/webhooks`

### WhatsApp Webhook
- **Endpoint:** `POST /api/v1/webhooks/whatsapp`
- **Description:** Receive WhatsApp messages for complaint submission and status tracking
- **Auth Required:** No
- **Request:** (Form-encoded from Twilio)
  ```
  Body: string (message content)
  From: string (WhatsApp number format)
  ```
- **Response:** XML response for Twilio
- **Features:**
  - Auto-create complaints from WhatsApp messages
  - Check complaint status by ticket ID
  - Trigger AI classification via Celery task

---

## 6. Health Check
- **Endpoint:** `GET /health`
- **Description:** Server health check
- **Auth Required:** No
- **Response:**
  ```json
  {
    "status": "ok"
  }
  ```
- **Frontend Usage:**
  ```typescript
  const health = await apiClient.healthCheck();
  ```

---

## Authentication & Authorization

### Authorization Header
All authenticated requests must include:
```
Authorization: Bearer <access_token>
```

### Role-Based Access
- **Politician:** Full access to all endpoints except WhatsApp
- **PA (Personal Assistant):** Access to analytics, briefing, and can manage complaints
- **FieldWorker:** Only see assigned complaints
- **Public:** Can submit complaints and view public complaints

### Token Storage (Frontend)
```typescript
// After login
localStorage.setItem('auth_token', response.access_token);
localStorage.setItem('auth_user', JSON.stringify(response.user));

// When making requests (auto-handled by apiClient)
const token = localStorage.getItem('auth_token');
headers['Authorization'] = `Bearer ${token}`;

// On logout
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');
```

---

## Error Handling

All error responses follow this format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Frontend Error Handling
```typescript
try {
  const result = await apiClient.someEndpoint();
  if (result.error) {
    console.error('API Error:', result.error);
  } else {
    // Use result.data
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Environment Configuration

### Frontend Environment Variables
Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8000
```

Or use defaults:
- Development: `http://localhost:8000`
- Production: Configure based on deployment

### Backend Server
Ensure backend is running on `http://localhost:8000` with CORS enabled for frontend origin.

---

## Integration Checklist

### Login/Register Flow
- [ ] Update [AuthContext.tsx](../frontend/src/contexts/AuthContext.tsx) to use apiClient
- [ ] Handle token storage and retrieval
- [ ] Implement role-based redirects
- [ ] Add error messages for failed login

### Complaints Management
- [ ] Create complaint submission form with apiClient
- [ ] Fetch complaints list and display
- [ ] Implement complaint detail view
- [ ] Add complaint status update functionality

### Analytics Dashboard
- [ ] Fetch and display summary statistics
- [ ] Render heatmap with GeoJSON data
- [ ] Create charts for category/status distribution

### AI Copilot
- [ ] Integrate chat interface with apiClient.sendCopilotMessage()
- [ ] Display morning briefing on dashboard
- [ ] Handle chat history management

### Public Features
- [ ] Allow anonymous complaint submission
- [ ] Display public complaints without authentication

---

## Testing API Endpoints

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=9876543210&password=password123"

# Get complaints (with auth)
curl http://localhost:8000/api/v1/complaints \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman/Insomnia
1. Create environment variable: `API_URL = http://localhost:8000`
2. Create auth collection with Bearer token
3. Test each endpoint with appropriate headers and body

---

## API Client Methods Summary

```typescript
import { apiClient } from '@/services/apiClient';

// Auth
apiClient.login(username, password)
apiClient.register(userData)

// Complaints
apiClient.createComplaint(data)
apiClient.getComplaints()
apiClient.getPublicComplaints()
apiClient.getComplaintDetail(id)
apiClient.updateComplaint(id, data)

// Analytics
apiClient.getAnalyticsSummary()
apiClient.getHeatmapData()

// Copilot
apiClient.sendCopilotMessage(message, history, queryType)
apiClient.getTodayBriefing()

// Health
apiClient.healthCheck()
```
