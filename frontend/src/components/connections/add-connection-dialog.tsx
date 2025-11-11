/**
 * Dialog for adding a new database connection
 */

"use client";

import { useState } from "react";
import { useConnections } from "@/lib/hooks/use-connections";
import type { CreateConnectionData } from "@/types/connection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface AddConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddConnectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddConnectionDialogProps) {
  const { createConnection, testConnection, loading } = useConnections();
  
  const [formData, setFormData] = useState<CreateConnectionData>({
    name: "",
    host: "",
    port: 5432,
    database: "",
    username: "",
    password: "",
    ssl_enabled: false,
  });

  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof CreateConnectionData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setTestStatus(null); // Reset test status when form changes
  };

  const handleTest = async () => {
    setError(null);
    setTestStatus(null);

    // Validate required fields
    if (!formData.host || !formData.database || !formData.username || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const result = await testConnection({
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        ssl_enabled: formData.ssl_enabled,
      });

      setTestStatus({
        tested: true,
        success: result.success,
        message: result.message,
      });
    } catch (err: any) {
      setTestStatus({
        tested: true,
        success: false,
        message: err.detail || err.message || "Connection test failed",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.name) {
      setError("Connection name is required");
      return;
    }

    if (!testStatus?.success) {
      setError("Please test the connection first to ensure it works");
      return;
    }

    try {
      await createConnection(formData);
      onSuccess();
      // Reset form
      setFormData({
        name: "",
        host: "",
        port: 5432,
        database: "",
        username: "",
        password: "",
        ssl_enabled: false,
      });
      setTestStatus(null);
    } catch (err: any) {
      setError(err.detail || err.message || "Failed to create connection");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Database Connection</DialogTitle>
          <DialogDescription>
            Connect to your PostgreSQL database to start querying with natural language.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Connection Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Connection Name *</Label>
              <Input
                id="name"
                placeholder="My Production Database"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            {/* Host */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host *</Label>
                <Input
                  id="host"
                  placeholder="localhost or db.example.com"
                  value={formData.host}
                  onChange={(e) => handleChange("host", e.target.value)}
                  required
                />
              </div>

              {/* Port */}
              <div className="space-y-2">
                <Label htmlFor="port">Port *</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="5432"
                  value={formData.port}
                  onChange={(e) => handleChange("port", parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Database */}
            <div className="space-y-2">
              <Label htmlFor="database">Database Name *</Label>
              <Input
                id="database"
                placeholder="myapp_production"
                value={formData.database}
                onChange={(e) => handleChange("database", e.target.value)}
                required
              />
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="dbuser"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* SSL Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="ssl">Enable SSL</Label>
                <div className="text-sm text-muted-foreground">
                  Use SSL/TLS for secure connection
                </div>
              </div>
              <Switch
                id="ssl"
                checked={formData.ssl_enabled}
                onCheckedChange={(checked) => handleChange("ssl_enabled", checked)}
              />
            </div>

            {/* Test Connection Status */}
            {testStatus && (
              <Alert
                variant={testStatus.success ? "default" : "destructive"}
                className={testStatus.success ? "border-green-600 bg-green-50" : ""}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{testStatus.message}</AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              type="submit"
              disabled={loading || !testStatus?.success}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Connection"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

