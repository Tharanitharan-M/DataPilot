/**
 * Main Dashboard Overview Page
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useConnections } from "@/lib/hooks/use-connections";
import { useQueries } from "@/lib/hooks/use-queries";
import type { Connection } from "@/types/connection";
import type { Query } from "@/types/query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Sparkles, History, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { listConnections } = useConnections();
  const { listQueries } = useQueries();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [recentQueries, setRecentQueries] = useState<Query[]>([]);
  const [stats, setStats] = useState({
    totalConnections: 0,
    totalQueries: 0,
    successfulQueries: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load connections
      const connectionsData = await listConnections();
      setConnections(connectionsData);

      // Load recent queries
      const queriesData = await listQueries(1, 5); // Get first 5 queries
      setRecentQueries(queriesData.queries);

      // Calculate stats
      setStats({
        totalConnections: connectionsData.length,
        totalQueries: queriesData.total,
        successfulQueries: queriesData.queries.filter(q => q.status === "success").length,
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-600">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to DataPilot - Your natural language database assistant
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConnections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active database connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQueries}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Questions asked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalQueries > 0
                ? Math.round((stats.successfulQueries / stats.totalQueries) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successful queries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/query">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Ask a Question</CardTitle>
              </div>
              <CardDescription>
                Query your database using natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Start Querying
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/connections">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Manage Connections</CardTitle>
              </div>
              <CardDescription>
                Add or configure your database connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Connections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Queries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Queries</CardTitle>
              <CardDescription>Your latest database questions</CardDescription>
            </div>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentQueries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No queries yet. Start by asking a question!</p>
              <Link href="/dashboard/query">
                <Button className="mt-4">
                  Ask Your First Question
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentQueries.map((query) => (
                <div
                  key={query.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{query.natural_language_query}</p>
                    {query.sql_query && (
                      <code className="text-xs text-muted-foreground mt-1 block truncate">
                        {query.sql_query}
                      </code>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                      </span>
                      {query.execution_time_ms && (
                        <span>{query.execution_time_ms}ms</span>
                      )}
                      {query.row_count !== null && (
                        <span>{query.row_count} rows</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(query.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
