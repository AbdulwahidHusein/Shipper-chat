/**
 * Centralized API Client
 * Clean, professional, and scalable API communication layer
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    statusCode: number;
  };
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: 'NETWORK_ERROR',
            statusCode: 0,
          },
        };
      }
      return {
        success: false,
        error: {
          message: 'Unknown error occurred',
          code: 'UNKNOWN_ERROR',
          statusCode: 0,
        },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// API endpoints
export const authApi = {
  getGoogleAuthUrl: () => {
    const base = API_BASE_URL.replace('/api', '');
    return `${base}/api/auth/google`;
  },
  getCurrentUser: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
};

export const userApi = {
  getUserProfile: (userId: string) => apiClient.get(`/users/${userId}`),
  updateProfile: (data: { name?: string; picture?: string }) =>
    apiClient.patch('/users/me', data),
  getAllUsers: () => apiClient.get('/users'),
  getOnlineUsers: () => apiClient.get('/users/online'),
};

export const sessionApi = {
  getSessions: (includeArchived?: boolean) =>
    apiClient.get(`/sessions${includeArchived ? '?archived=true' : ''}`),
  getSession: (sessionId: string) => apiClient.get(`/sessions/${sessionId}`),
  createSession: (data: { participant2Id: string; type?: 'DIRECT' | 'GROUP' | 'AI' }) =>
    apiClient.post('/sessions', data),
  archiveSession: (sessionId: string) =>
    apiClient.patch(`/sessions/${sessionId}/archive`),
  unarchiveSession: (sessionId: string) =>
    apiClient.patch(`/sessions/${sessionId}/unarchive`),
  muteSession: (sessionId: string) =>
    apiClient.patch(`/sessions/${sessionId}/mute`),
  unmuteSession: (sessionId: string) =>
    apiClient.patch(`/sessions/${sessionId}/unmute`),
  markUnread: (sessionId: string) =>
    apiClient.patch(`/sessions/${sessionId}/mark-unread`),
  deleteSession: (sessionId: string) =>
    apiClient.delete(`/sessions/${sessionId}`),
};

export const messageApi = {
  getMessages: (sessionId: string, limit?: number, cursor?: string) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);
    const query = params.toString();
    return apiClient.get(`/messages/session/${sessionId}${query ? `?${query}` : ''}`);
  },
  sendMessage: (data: {
    content: string;
    sessionId: string;
    type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'LINK';
  }) => apiClient.post('/messages', data),
  editMessage: (messageId: string, data: { content: string }) =>
    apiClient.patch(`/messages/${messageId}`, data),
  markRead: (messageId: string) =>
    apiClient.patch(`/messages/${messageId}/read`),
  markAllRead: (sessionId: string) =>
    apiClient.patch(`/messages/session/${sessionId}/read-all`),
  deleteMessage: (messageId: string) =>
    apiClient.delete(`/messages/${messageId}`),
  clearMessages: (sessionId: string) =>
    apiClient.delete(`/messages/session/${sessionId}/clear`),
};

export const sharedContentApi = {
  getSharedMedia: (sessionId: string) =>
    apiClient.get(`/shared/media/session/${sessionId}`),
  shareMedia: (data: {
    type: 'IMAGE' | 'VIDEO';
    url: string;
    thumbnailUrl: string;
    sessionId: string;
  }) => apiClient.post('/shared/media', data),
  getSharedLinks: (sessionId: string) =>
    apiClient.get(`/shared/links/session/${sessionId}`),
  shareLink: (data: {
    url: string;
    title: string;
    description?: string;
    favicon?: string;
    sessionId: string;
  }) => apiClient.post('/shared/links', data),
  getSharedDocuments: (sessionId: string) =>
    apiClient.get(`/shared/documents/session/${sessionId}`),
  shareDocument: (data: {
    name: string;
    type: 'PDF' | 'DOC' | 'DOCX' | 'FIG' | 'AI' | 'PSD' | 'XD' | 'SKETCH';
    size: number;
    pages?: number;
    url?: string;
    sessionId: string;
  }) => apiClient.post('/shared/documents', data),
};
