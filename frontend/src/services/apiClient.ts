/**
 * API Client Service
 * Centralized API call management for P-CRM Frontend
 * 
 * Base URL: http://localhost:8000 (or configured via VITE_API_URL)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'API request failed');
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
      };
    }
  }

  // ============ AUTH ENDPOINTS ============
  /**
   * POST /api/v1/auth/login
   * Login with phone or email
   */
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return await response.json();
  }

  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  async register(userData: {
    phone: string;
    email: string;
    name: string;
    password: string;
    role: 'FieldWorker' | 'PA' | 'Politician';
    constituency_id?: string;
    ward_id?: string;
  }) {
    return this.request('/api/v1/auth/register', 'POST', userData);
  }

  // ============ COMPLAINTS ENDPOINTS ============
  /**
   * POST /api/v1/complaints
   * Create a new complaint
   */
  async createComplaint(complaintData: {
    citizen_phone?: string;
    category: string;
    description: string;
    priority?: number;
    ward_id?: string;
    constituency_id?: string;
    channel?: 'web' | 'whatsapp' | 'sms';
  }) {
    return this.request('/api/v1/complaints', 'POST', complaintData);
  }

  /**
   * GET /api/v1/complaints
   * Get complaints (filtered by user role)
   */
  async getComplaints() {
    return this.request('/api/v1/complaints', 'GET');
  }

  /**
   * GET /api/v1/complaints/public
   * Get publicly published complaints
   */
  async getPublicComplaints() {
    return this.request('/api/v1/complaints/public', 'GET');
  }

  /**
   * GET /api/v1/complaints/{complaint_id}
   * Get single complaint details
   */
  async getComplaintDetail(complaintId: string) {
    return this.request(`/api/v1/complaints/${complaintId}`, 'GET');
  }

  /**
   * PUT /api/v1/complaints/{complaint_id}
   * Update complaint status or details
   */
  async updateComplaint(complaintId: string, updateData: any) {
    return this.request(`/api/v1/complaints/${complaintId}`, 'PUT', updateData);
  }

  // ============ ANALYTICS ENDPOINTS ============
  /**
   * GET /api/v1/analytics/summary
   * Get constituency summary (requires PA or Politician role)
   */
  async getAnalyticsSummary() {
    return this.request('/api/v1/analytics/summary', 'GET');
  }

  /**
   * GET /api/v1/analytics/heatmap
   * Get ward-wise heatmap data (requires PA or Politician role)
   */
  async getHeatmapData() {
    return this.request('/api/v1/analytics/heatmap', 'GET');
  }

  // ============ COPILOT ENDPOINTS ============
  /**
   * POST /api/v1/copilot/chat
   * Send chat message to AI copilot (requires Politician role)
   */
  async sendCopilotMessage(message: string, history: any[] = [], queryType: string = 'general') {
    return this.request('/api/v1/copilot/chat', 'POST', {
      message,
      history,
      query_type: queryType,
    });
  }

  /**
   * GET /api/v1/copilot/briefing/today
   * Get today's morning briefing
   */
  async getTodayBriefing() {
    return this.request('/api/v1/copilot/briefing/today', 'GET');
  }

  // ============ HEALTH CHECK ============
  /**
   * GET /health
   * Health check endpoint
   */
  async healthCheck() {
    return this.request('/health', 'GET');
  }
}

export const apiClient = new ApiClient();
