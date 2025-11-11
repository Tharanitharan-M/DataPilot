/**
 * Natural Language Query Interface Page
 */

"use client";

import { useEffect, useState } from "react";
import { useConnections } from "@/lib/hooks/use-connections";
import { useQueries } from "@/lib/hooks/use-queries";
import type { Connection } from "@/types/connection";
import type { QueryResult } from "@/types/query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Database, Sparkles, Code2, AlertCircle, Download, Clock } from "lucide-react";
import { QueryResultsTable } from "@/components/queries/query-results-table";
import { SQLDisplay } from "@/components/queries/sql-display";

export default function QueryPage() {
  const { listConnections } = useConnections();
  const { executeQuery, loading: queryLoading, error: queryError } = useQueries();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await listConnections();
      setConnections(data);
      // Auto-select first connection
      if (data.length > 0 && !selectedConnectionId) {
        setSelectedConnectionId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load connections:", err);
    }
  };

  const handleExecuteQuery = async () => {
    if (!naturalLanguageQuery.trim()) {
      setError("Please enter a question");
      return;
    }

    if (!selectedConnectionId) {
      setError("Please select a database connection");
      return;
    }

    setError(null);
    setQueryResult(null);

    try {
      const result = await executeQuery({
        natural_language_query: naturalLanguageQuery,
        connection_id: selectedConnectionId,
      });
      setQueryResult(result);
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to execute query");
    }
  };

  const handleExport = (format: "csv" | "json") => {
    if (!queryResult) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "csv") {
      // Convert to CSV
      const headers = queryResult.columns.join(",");
      const rows = queryResult.data.map((row) =>
        queryResult.columns.map((col) => JSON.stringify(row[col] ?? "")).join(",")
      );
      content = [headers, ...rows].join("\n");
      filename = "query-results.csv";
      mimeType = "text/csv";
    } else {
      // Export as JSON
      content = JSON.stringify(queryResult.data, null, 2);
      filename = "query-results.json";
      mimeType = "application/json";
    }

    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedConnection = connections.find((c) => c.id === selectedConnectionId);

  // Example queries for inspiration
  const exampleQueries = [
    "Show me the first 10 users ordered by signup date",
    "Count how many orders were placed last month",
    "What are the top 5 products by revenue?",
    "Find all customers from California",
    "Show me users who haven't logged in for 30 days",
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Ask Questions in Natural Language
        </h1>
        <p className="text-muted-foreground mt-2">
          Ask questions about your data in plain English. We'll convert it to SQL and show you the results.
        </p>
      </div>

      {/* Main Query Interface */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Query Input */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Question</CardTitle>
            <CardDescription>
              Ask anything about your data. Be specific for better results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Database Connection</label>
              <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a database connection">
                    {selectedConnection && (
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {selectedConnection.name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {connections.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No connections available. Add one first.
                    </div>
                  ) : (
                    connections.map((connection) => (
                      <SelectItem key={connection.id} value={connection.id}>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          {connection.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Query Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Question</label>
              <Textarea
                placeholder="e.g., Show me the top 10 customers by revenue this year"
                value={naturalLanguageQuery}
                onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                rows={5}
                className="resize-none font-mono text-sm"
              />
            </div>

            {/* Execute Button */}
            <Button
              onClick={handleExecuteQuery}
              disabled={queryLoading || !selectedConnectionId}
              size="lg"
              className="w-full"
            >
              {queryLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating SQL and executing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Execute Query
                </>
              )}
            </Button>

            {/* Error Alert */}
            {(error || queryError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || queryError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Examples & Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Example Questions</CardTitle>
            <CardDescription>Click to use as a starting point</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors text-sm"
                  onClick={() => setNaturalLanguageQuery(example)}
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 Tips for better results:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Be specific about what data you want</li>
                <li>• Mention time ranges when relevant</li>
                <li>• Use table and column names if you know them</li>
                <li>• Keep it simple and clear</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Results */}
      {queryResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Query Results</CardTitle>
                <CardDescription>
                  {queryResult.row_count} {queryResult.row_count === 1 ? "row" : "rows"} returned
                  {" • "}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {queryResult.execution_time_ms}ms
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="sql">
                  <Code2 className="mr-2 h-4 w-4" />
                  SQL Query
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="mt-4">
                <QueryResultsTable
                  columns={queryResult.columns}
                  data={queryResult.data}
                />
              </TabsContent>
              
              <TabsContent value="sql" className="mt-4">
                <SQLDisplay sql={queryResult.sql_query} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

