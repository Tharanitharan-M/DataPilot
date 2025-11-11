/**
 * React hooks for database connections
 */

"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/api-client";
import type {
  Connection,
  CreateConnectionData,
  UpdateConnectionData,
  TestConnectionData,
  TestConnectionResult,
} from "@/types/connection";

const BASE_PATH = "/api/v1/connections";

export function useConnections() {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listConnections = useCallback(
    async (organizationId?: string): Promise<Connection[]> => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (organizationId) {
          params.organization_id = organizationId;
        }
        const data = await api.get<Connection[]>(BASE_PATH, params);
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to fetch connections");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const getConnection = useCallback(
    async (id: string): Promise<Connection> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<Connection>(`${BASE_PATH}/${id}`);
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to fetch connection");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const createConnection = useCallback(
    async (connectionData: CreateConnectionData): Promise<Connection> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.post<Connection>(BASE_PATH, connectionData);
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to create connection");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const updateConnection = useCallback(
    async (
      id: string,
      connectionData: UpdateConnectionData
    ): Promise<Connection> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.patch<Connection>(
          `${BASE_PATH}/${id}`,
          connectionData
        );
        return data;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const deleteConnection = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`${BASE_PATH}/${id}`);
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to delete connection");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const testConnection = useCallback(
    async (testData: TestConnectionData): Promise<TestConnectionResult> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.post<TestConnectionResult>(
          `${BASE_PATH}/test`,
          testData
        );
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to test connection");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const testExistingConnection = useCallback(
    async (id: string): Promise<TestConnectionResult> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.post<TestConnectionResult>(
          `${BASE_PATH}/${id}/test`
        );
        return data;
      } catch (err: any) {
        setError(
          err.detail || err.message || "Failed to test existing connection"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    loading,
    error,
    listConnections,
    getConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    testExistingConnection,
  };
}

