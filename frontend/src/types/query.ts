/**
 * TypeScript types for queries
 */

export interface Query {
  id: string;
  user_id: string;
  organization_id: string | null;
  connection_id: string | null;
  document_id: string | null;
  natural_language_query: string;
  sql_query: string | null;
  query_type: string;
  status: string;
  row_count: number | null;
  execution_time_ms: number | null;
  error_message: string | null;
  is_saved: boolean;
  title: string | null;
  created_at: string;
}

export interface ExecuteQueryData {
  natural_language_query: string;
  connection_id?: string;
  document_id?: string;
}

export interface QueryResult {
  query_id: string;
  sql_query: string;
  columns: string[];
  data: Record<string, any>[];
  row_count: number;
  execution_time_ms: number;
  status: string;
}

export interface SaveQueryData {
  title: string;
}

export interface QueryListResponse {
  queries: Query[];
  total: number;
  page: number;
  page_size: number;
}

