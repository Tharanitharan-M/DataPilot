/**
 * Main Dashboard Overview Page - Professional Design
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
import { Database, Sparkles, History, ArrowRight, TrendingUp, Clock, Zap, CheckCircle2, XCircle } from "lucide-react";
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
    successRate: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const connectionsData = await listConnections();
      setConnections(connectionsData);

      const queriesData = await listQueries(1, 5);
      setRecentQueries(queriesData.queries);

      const successCount = queriesData.queries.filter(q => q.status === "success").length;
      setStats({
        totalConnections: connectionsData.length,
        totalQueries: queriesData.total,
        successfulQueries: successCount,
        successRate: queriesData.total > 0 ? Math.round((successCount / queriesData.total) * 100) : 0,
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
          Welcome to DataPilot
        </h1>
        <p className="text-lg text-slate-600">
          Your AI-powered database assistant. Ask questions in natural language and get instant insights.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Connections */}
        <Card className="relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Connections</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Database className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalConnections}</div>
            <p className="text-xs text-slate-500 mt-1">Active database connections</p>
          </CardContent>
        </Card>

        {/* Total Queries */}
        <Card className="relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Queries</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalQueries}</div>
            <p className="text-xs text-slate-500 mt-1">Questions asked</p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="relative overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.successRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Successful queries</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ask Question Card */}
        <Link href="/dashboard/query">
          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Ask a Question</CardTitle>
                  <CardDescription className="text-slate-600">
                    Query your database using natural language
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all">
                Start Querying
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Manage Connections Card */}
        <Link href="/dashboard/connections">
          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Manage Connections</CardTitle>
                  <CardDescription className="text-slate-600">
                    Add or configure your database connections
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50 hover:border-purple-300 group-hover:shadow-lg transition-all">
                View Connections
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Queries */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Recent Queries</CardTitle>
              <CardDescription className="text-slate-600">Your latest database questions</CardDescription>
            </div>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentQueries.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No queries yet</h3>
              <p className="text-slate-600 mb-6">Start by asking a question about your data!</p>
              <Link href="/dashboard/query">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ask Your First Question
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentQueries.map((query) => (
                <div
                  key={query.id}
                  className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {query.natural_language_query}
                    </p>
                    {query.sql_query && (
                      <code className="text-xs text-slate-500 mt-1 block truncate bg-slate-100 px-2 py-1 rounded">
                        {query.sql_query}
                      </code>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                      </span>
                      {query.execution_time_ms && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {query.execution_time_ms}ms
                        </span>
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
