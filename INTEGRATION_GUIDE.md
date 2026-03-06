# Frontend-Backend Integration Guide

This document provides step-by-step instructions for connecting all frontend components to the backend API endpoints.

## Overview

The frontend is now configured to connect to the backend API. All API calls are centralized in the `apiClient` service.

### Files Modified/Created

1. **[apiClient.ts](frontend/src/services/apiClient.ts)** - New API service
2. **[AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)** - Updated to use real API
3. **[aiService.ts](frontend/src/services/aiService.ts)** - Updated to call real API
4. **[Login.tsx](frontend/src/pages/Login.tsx)** - Updated for real authentication
5. **[.env.example](frontend/.env.example)** - Environment configuration template

---

## 1. Setup

### Step 1: Configure Environment
```bash
# Frontend root directory
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

### Step 2: Start Backend Server
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Step 3: Start Frontend Server
```bash
cd frontend
npm run dev
```

---

## 2. Feature Integration Map

### A. Authentication Flow

**Files Involved:**
- Backend: `routers/auth.py`
- Frontend: `contexts/AuthContext.tsx`, `pages/Login.tsx`, `services/apiClient.ts`

**API Endpoints:**
```
POST /api/v1/auth/login
POST /api/v1/auth/register
```

**Current Status:** ✅ INTEGRATED
- Login page updated to use real credentials
- AuthContext calls `apiClient.login(username, password)`
- Token stored in `localStorage`
- Automatic header injection in all requests

**Test with curl:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=9876543210&password=yourpassword"
```

---

### B. Complaints Management

**Files to Update:**
- Frontend: `pages/politician/ActiveWorks.tsx` (GET complaints)
- Frontend: `pages/worker/Dashboard.tsx` (GET complaints)
- Frontend: Create new `pages/ComplaintForm.tsx` (POST complaints)

**API Endpoints:**
```
POST /api/v1/complaints          (Create complaint)
GET /api/v1/complaints           (Get complaints - role filtered)
GET /api/v1/complaints/public    (Get public complaints)
GET /api/v1/complaints/{id}      (Get single complaint) - TODO
PUT /api/v1/complaints/{id}      (Update complaint) - TODO
```

**Integration Example:**
```typescript
// In your component
import { apiClient } from '@/services/apiClient';
import { useEffect, useState } from 'react';

export function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getComplaints();
        if (response.data) {
          setComplaints(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {complaints.map(complaint => (
        <div key={complaint.id}>
          <h3>{complaint.ticket_id}: {complaint.category}</h3>
          <p>{complaint.description}</p>
          <span>Status: {complaint.status}</span>
        </div>
      ))}
    </div>
  );
}
```

---

### C. Analytics Dashboard

**Files to Update:**
- Frontend: `pages/politician/Analytics.tsx`
- Frontend: Create new `components/HeatmapChart.tsx`

**API Endpoints:**
```
GET /api/v1/analytics/summary    (Get complaint statistics)
GET /api/v1/analytics/heatmap    (Get ward data for map visualization)
```

**Integration Example:**
```typescript
import { apiClient } from '@/services/apiClient';

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await apiClient.getAnalyticsSummary();
      if (response.data) {
        setSummary(response.data);
      }
    };
    fetchAnalytics();
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div>
      <h2>Total Complaints: {summary.total}</h2>
      <h3>Open: {summary.open} | Resolved: {summary.resolved}</h3>
      <div>
        {Object.entries(summary.by_category).map(([category, count]) => (
          <div key={category}>{category}: {count}</div>
        ))}
      </div>
    </div>
  );
}
```

---

### D. AI Copilot Integration

**Files to Update:**
- Frontend: `components/ai/ChatDrawer.tsx`
- Frontend: `pages/politician/Dashboard.tsx` (Briefing display)

**API Endpoints:**
```
POST /api/v1/copilot/chat              (Send message to AI)
GET /api/v1/copilot/briefing/today     (Get morning briefing)
```

**Current Status:** ⚠️ PARTIAL (Falls back to mock if API unavailable)

**Integration Example:**
```typescript
import { apiClient } from '@/services/apiClient';

export function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help?', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.sendCopilotMessage(
        input,
        newMessages,
        'general'
      );

      if (response.data?.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.role}`}>
          {msg.content}
        </div>
      ))}
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          disabled={loading}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

---

### E. Public Complaint Submission

**Files to Update:**
- Frontend: `pages/Index.tsx` (Public page)
- Frontend: Create new `components/PublicComplaintForm.tsx`

**API Endpoints:**
```
POST /api/v1/complaints          (Public endpoint - no auth required)
GET /api/v1/complaints/public    (Get public complaints)
```

**Integration Example:**
```typescript
import { apiClient } from '@/services/apiClient';

export function PublicComplaintForm() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.createComplaint({
        category,
        description,
        priority: 3,
        channel: 'web'
      });

      if (response.data?.ticket_id) {
        setSuccess(true);
        console.log('Complaint submitted:', response.data.ticket_id);
      }
    } catch (error) {
      console.error('Failed to submit complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={category} onChange={e => setCategory(e.target.value)} required>
        <option>Select Category</option>
        <option>Water Supply</option>
        <option>Road Maintenance</option>
        {/* More options */}
      </select>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Describe your complaint"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>
      {success && <p>Thank you! Your complaint has been registered.</p>}
    </form>
  );
}
```

---

## 3. Integration Checklist

### Authentication
- [x] API client created with login method
- [x] AuthContext updated to use API
- [x] Login page updated for username/password
- [x] Token storage implementation
- [ ] Register page integration
- [ ] "Forgot Password" functionality (if needed)

### Complaints
- [ ] GET complaints list on politician dashboard
- [ ] GET complaints list on worker dashboard
- [ ] POST complaint creation form
- [ ] Complaint detail view (GET by ID)
- [ ] Update complaint status (PUT)
- [ ] Public complaints display

### Analytics
- [ ] Fetch and display summary statistics
- [ ] Create charts from category/status data
- [ ] Render heatmap visualization
- [ ] Ward-wise distribution analysis

### Copilot
- [ ] Chat interface connection
- [ ] Morning briefing display
- [ ] Chat history management
- [ ] Query type handling

### Webhooks (Backend-only)
- [x] WhatsApp integration endpoint (backend)
- [ ] Frontend status tracking UI
- [ ] SMS integration (if needed)

---

## 4. Error Handling Best Practices

### Pattern to Follow

```typescript
import { useState } from 'react';
import { apiClient } from '@/services/apiClient';

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.someEndpoint();

      if (response.error) {
        // API returned an error
        setError(response.error);
      } else if (response.data) {
        // Success
        setData(response.data);
      } else {
        // Unknown issue
        setError('An unexpected error occurred');
      }
    } catch (err) {
      // Network or other errors
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return <div>{/* Display data */}</div>;
}
```

---

## 5. Testing Endpoints

### Manual Testing

```bash
# Test backend is running
curl http://localhost:8000/health

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=9876543210&password=yourpassword"

# Save the token
TOKEN="your_access_token_here"

# Test getting complaints (requires auth)
curl http://localhost:8000/api/v1/complaints \
  -H "Authorization: Bearer $TOKEN"

# Test public complaints (no auth required)
curl http://localhost:8000/api/v1/complaints/public

# Test analytics (requires auth + role)
curl http://localhost:8000/api/v1/analytics/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Browser Testing
1. Open frontend: `http://localhost:8080`
2. Navigate to Login page
3. Enter credentials (phone/email and password)
4. Check browser console for API errors
5. Verify token is stored in localStorage

---

## 6. Common Issues & Solutions

### Issue: CORS Error
```
Access to XMLHttpRequest at '...' from origin '...' blocked by CORS policy
```
**Solution:** Backend CORS middleware is configured to allow all origins. Check:
1. Backend is running on correct port (8000)
2. Frontend is making requests to correct URL (check VITE_API_URL)
3. Backend middleware includes proper headers

### Issue: 401 Unauthorized
```json
{"detail": "Not authenticated"}
```
**Solution:**
1. Check token is present in localStorage
2. Verify token is being sent in Authorization header
3. Token might be expired - re-login

### Issue: 403 Forbidden
```json
{"detail": "Not enough permissions"}
```
**Solution:**
1. Check user role matches requirement
2. Verify user has required role for the endpoint

### Issue: 404 Not Found
```json
{"detail": "Not found"}
```
**Solution:**
1. Check API endpoint URL is correct
2. Verify backend is running
3. Resource might not exist in database

---

## 7. Performance Optimization

### Caching
```typescript
import { useQuery } from '@tanstack/react-query';

export function ComplaintsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => apiClient.getComplaints(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use data, isLoading, error
}
```

### Lazy Loading
```typescript
const analytics = await import('@/services/analyticsService');
const data = await analytics.fetchSummary();
```

### Debouncing Search
```typescript
import { useCallback, useState } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

const handleSearch = useCallback((term: string) => {
  clearTimeout(debounceTimer);
  setSearchTerm(term);

  const timer = setTimeout(async () => {
    const results = await apiClient.searchComplaints(term);
    // Display results
  }, 300);

  setDebounceTimer(timer);
}, [debounceTimer]);
```

---

## 8. Deployment Notes

### Environment Variables to Update
```env
# Production
VITE_API_URL=https://api.yourserver.com
```

### Backend Configuration
Ensure backend DEPLOY_ENV or similar is set correctly for production.

### HTTPS/SSL
- Frontend and backend should both use HTTPS in production
- Update CORS configuration if domains differ

---

## 9. Future Enhancements

- [ ] Implement real-time websocket updates
- [ ] Add request caching with React Query
- [ ] Implement request retry logic
- [ ] Add API rate limiting handling
- [ ] Implement request/response interceptors
- [ ] Add request timeout handling
- [ ] Implement file upload for complaint evidence

---

## 10. Support & Debugging

### Check Backend Logs
```bash
# Terminal where backend is running
# Should show request logs and errors
```

### Check Frontend Logs
```bash
# Browser DevTools → Console
# Look for API error messages
```

### Network Tab Analysis
1. Open Browser DevTools → Network tab
2. Make an API call
3. Click on the request
4. Check:
   - Request headers (Authorization present?)
   - Response status code
   - Response body (error message?)

---

## Questions or Issues?

Refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint specifications.
