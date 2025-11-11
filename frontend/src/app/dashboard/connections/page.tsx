/**
 * Database Connections Management Page
 */

"use client";

import { useEffect, useState } from "react";
import { useConnections } from "@/lib/hooks/use-connections";
import type { Connection } from "@/types/connection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Database, Trash2, TestTube2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddConnectionDialog } from "@/components/connections/add-connection-dialog";
import { formatDistanceToNow } from "date-fns";

export default function ConnectionsPage() {
  const {
    loading,
    error,
    listConnections,
    deleteConnection,
    testExistingConnection,
  } = useConnections();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set());

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      const data = await listConnections();
      setConnections(data);
    } catch (err) {
      console.error("Failed to load connections:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this connection?")) return;
    
    try {
      await deleteConnection(id);
      setConnections(connections.filter((conn) => conn.id !== id));
    } catch (err) {
      console.error("Failed to delete connection:", err);
    }
  };

  const handleTest = async (id: string) => {
    setTestingIds(new Set(testingIds).add(id));
    try {
      const result = await testExistingConnection(id);
      if (result.success) {
        alert(`Connection successful! Response time: ${result.response_time_ms}ms`);
      } else {
        alert(`Connection failed: ${result.error}`);
      }
      // Reload connections to get updated test status
      await loadConnections();
    } catch (err: any) {
      alert(`Connection test failed: ${err.message}`);
    } finally {
      const newSet = new Set(testingIds);
      newSet.delete(id);
      setTestingIds(newSet);
    }
  };

  const getStatusBadge = (connection: Connection) => {
    if (!connection.last_tested_at) {
      return <Badge variant="secondary">Not Tested</Badge>;
    }
    if (connection.last_test_status === "success") {
      return <Badge variant="default" className="bg-green-600">Connected</Badge>;
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Connections</h1>
          <p className="text-muted-foreground mt-2">
            Connect your PostgreSQL databases to start querying with natural language
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connections Grid */}
      {loading && connections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading connections...</p>
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Add your first database connection to start asking questions in natural language.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <Card key={connection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">{connection.name}</CardTitle>
                  </div>
                  {getStatusBadge(connection)}
                </div>
                <CardDescription className="mt-2">
                  {connection.host}:{connection.port}/{connection.database}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Connection Details */}
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{connection.connection_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-medium">{connection.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SSL:</span>
                      <span className="font-medium">
                        {connection.ssl_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    {connection.last_tested_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last tested:</span>
                        <span className="font-medium text-xs">
                          {formatDistanceToNow(new Date(connection.last_tested_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTest(connection.id)}
                      disabled={testingIds.has(connection.id)}
                    >
                      <TestTube2 className="mr-2 h-4 w-4" />
                      {testingIds.has(connection.id) ? "Testing..." : "Test"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(connection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Connection Dialog */}
      <AddConnectionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          loadConnections();
          setShowAddDialog(false);
        }}
      />
    </div>
  );
}

