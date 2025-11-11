/**
 * TypeScript types for database connections
 */

export interface Connection {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  connection_type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  ssl_enabled: boolean;
  is_active: boolean;
  last_tested_at: string | null;
  last_test_status: string | null;
  last_test_error: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateConnectionData {
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connection_type?: string;
  ssl_enabled?: boolean;
  organization_id?: string | null;
}

export interface UpdateConnectionData {
  name?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl_enabled?: boolean;
  is_active?: boolean;
}

export interface TestConnectionData {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl_enabled?: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  error?: string;
  response_time_ms?: number;
}

