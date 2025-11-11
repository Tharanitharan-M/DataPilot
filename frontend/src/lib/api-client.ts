/**
 * Client-side API Client for DataPilot Backend
 * For use in client components (uses useAuth from Clerk)
 */

"use client";

import { useAuth } from "@clerk/nextjs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

/**
 * Client-side API hook
 * Use this in Client Components
 */
export function useApi() {
  const { getToken } = useAuth();

  const getAuthHeaders = async (): Promise<HeadersInit> => {
    try {
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
  };

  const handleResponse = async <T,>(response: Response): Promise<T> => {
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
  };

  const get = async <T,>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value)
      );
    }

    const headers = await getAuthHeaders();
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    return handleResponse<T>(response);
  };

  const post = async <T,>(endpoint: string, data?: unknown): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  };

  const patch = async <T,>(endpoint: string, data?: unknown): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  };

  const del = async <T,>(endpoint: string): Promise<T> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse<T>(response);
  };

  return {
    get,
    post,
    patch,
    delete: del,
  };
}

