/**
 * React hooks for queries
 */

"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/api-client";
import type {
  Query,
  ExecuteQueryData,
  QueryResult,
  SaveQueryData,
  QueryListResponse,
} from "@/types/query";

const BASE_PATH = "/api/v1/queries";

export function useQueries() {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(
    async (queryData: ExecuteQueryData): Promise<QueryResult> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.post<QueryResult>(
          `${BASE_PATH}/execute`,
          queryData
        );
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to execute query");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const listQueries = useCallback(
    async (
      page: number = 1,
      pageSize: number = 20,
      savedOnly: boolean = false
    ): Promise<QueryListResponse> => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: page.toString(),
          page_size: pageSize.toString(),
          saved_only: savedOnly.toString(),
        };
        const data = await api.get<QueryListResponse>(BASE_PATH, params);
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to fetch queries");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const getQuery = useCallback(
    async (id: string): Promise<Query> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<Query>(`${BASE_PATH}/${id}`);
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to fetch query");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const saveQuery = useCallback(
    async (id: string, saveData: SaveQueryData): Promise<Query> => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.post<Query>(`${BASE_PATH}/${id}/save`, saveData);
        return data;
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to save query");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const deleteQuery = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`${BASE_PATH}/${id}`);
      } catch (err: any) {
        setError(err.detail || err.message || "Failed to delete query");
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
    executeQuery,
    listQueries,
    getQuery,
    saveQuery,
    deleteQuery,
  };
}

