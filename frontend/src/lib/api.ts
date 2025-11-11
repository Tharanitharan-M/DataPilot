/**
 * API Client for DataPilot Backend
 * Automatically includes Clerk authentication tokens
 */

import { auth } from "@clerk/nextjs/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authentication headers with Clerk token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      const { getToken } = await auth();
      const token = await getToken();

      return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      return {
        "Content-Type": "application/json",
      };
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: response.statusText,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.detail = errorData.detail || errorData.message;
      } catch {
        // Response body is not JSON
      }

      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value)
      );
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export typed API methods
export const api = {
  // User endpoints
  users: {
    getMe: () => apiClient.get("/api/v1/users/me"),
    updateMe: (data: { first_name?: string; last_name?: string }) =>
      apiClient.patch("/api/v1/users/me", data),
    getOrganizationMembers: () =>
      apiClient.get("/api/v1/users/organization/members"),
    getOrganizationInfo: () =>
      apiClient.get("/api/v1/users/organization/info"),
  },

  // Dataset endpoints
  datasets: {
    list: (params?: { skip?: number; limit?: number }) =>
      apiClient.get(
        "/api/v1/datasets",
        params as Record<string, string> | undefined
      ),
    get: (id: string) => apiClient.get(`/api/v1/datasets/${id}`),
    create: (data: { name: string; description?: string }) =>
      apiClient.post("/api/v1/datasets", data),
    update: (id: string, data: { name?: string; description?: string }) =>
      apiClient.patch(`/api/v1/datasets/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/datasets/${id}`),
  },
};

