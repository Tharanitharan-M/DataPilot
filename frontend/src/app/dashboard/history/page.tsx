/**
 * Query History Page
 */

"use client";

import { useEffect, useState } from "react";
import { useQueries } from "@/lib/hooks/use-queries";
import type { Query } from "@/types/query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { History, Search, Trash2, BookmarkPlus, AlertCircle, Clock, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPage() {
  const { listQueries, deleteQuery, loading, error } = useQueries();
  
  const [queries, setQueries] = useState<Query[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadQueries();
  }, [page, showSavedOnly]);

  useEffect(() => {
    // Filter queries based on search term
    if (searchTerm.trim()) {
      const filtered = queries.filter((query) =>
        query.natural_language_query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.sql_query?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQueries(filtered);
    } else {
      setFilteredQueries(queries);
    }
  }, [searchTerm, queries]);

  const loadQueries = async () => {
    try {
      const data = await listQueries(page, pageSize, showSavedOnly);
      setQueries(data.queries);
      setFilteredQueries(data.queries);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load queries:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this query?")) return;
    
    try {
      await deleteQuery(id);
      setQueries(queries.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Failed to delete query:", err);
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Query History
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage your past queries
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Saved Only Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="saved-only"
                checked={showSavedOnly}
                onCheckedChange={setShowSavedOnly}
              />
              <Label htmlFor="saved-only">Saved only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Queries List */}
      {loading && queries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No queries found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try a different search term" : "Start asking questions to see your history"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredQueries.map((query) => (
              <Card key={query.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title or Question */}
                      <div className="flex items-center gap-2 mb-2">
                        {query.is_saved && (
                          <BookmarkPlus className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                        <h3 className="font-semibold truncate">
                          {query.title || query.natural_language_query}
                        </h3>
                      </div>

                      {/* SQL Query */}
                      {query.sql_query && (
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto mb-3">
                          <code>{query.sql_query}</code>
                        </pre>
                      )}

                      {/* Error Message */}
                      {query.error_message && (
                        <Alert variant="destructive" className="mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {query.error_message}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
                        </span>
                        {query.execution_time_ms && (
                          <span>{query.execution_time_ms}ms</span>
                        )}
                        {query.row_count !== null && (
                          <span>{query.row_count} {query.row_count === 1 ? "row" : "rows"}</span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {query.query_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(query.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(query.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

