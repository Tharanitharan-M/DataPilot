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
import { Loader2, CheckCircle2, XCircle, Database, Server, Lock, Info } from "lucide-react";

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">Add Database Connection</DialogTitle>
              <DialogDescription className="text-base">
                Connect to your PostgreSQL database to start querying with natural language.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Connection Details Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>CONNECTION DETAILS</span>
            </div>
            
            {/* Connection Name */}
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-1.5">
                Connection Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., My Production Database"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                required
              />
              <p className="text-xs text-muted-foreground">
                A friendly name to identify this connection
              </p>
            </div>
          </div>

          {/* Server Configuration Section */}
          <div className="space-y-5 border-t pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Server className="h-4 w-4" />
              <span>SERVER CONFIGURATION</span>
            </div>

            {/* Host and Port */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2.5 sm:col-span-2">
                <Label htmlFor="host" className="text-sm font-semibold flex items-center gap-1.5">
                  Host <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="host"
                  placeholder="localhost or db.example.com"
                  value={formData.host}
                  onChange={(e) => handleChange("host", e.target.value)}
                  className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="port" className="text-sm font-semibold flex items-center gap-1.5">
                  Port <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="5432"
                  value={formData.port}
                  onChange={(e) => handleChange("port", parseInt(e.target.value))}
                  className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Database */}
            <div className="space-y-2.5">
              <Label htmlFor="database" className="text-sm font-semibold flex items-center gap-1.5">
                Database Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="database"
                placeholder="e.g., myapp_production"
                value={formData.database}
                onChange={(e) => handleChange("database", e.target.value)}
                className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Authentication Section */}
          <div className="space-y-5 border-t pt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>AUTHENTICATION</span>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-1.5">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  placeholder="Database user"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-1.5">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-11 text-base border-2 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* SSL Toggle */}
            <div className="flex items-center justify-between rounded-xl border-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 transition-colors hover:border-blue-200 dark:hover:border-blue-800">
              <div className="space-y-1 flex-1 pr-4">
                <Label htmlFor="ssl" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Enable SSL/TLS
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recommended for production databases
                </p>
              </div>
              <Switch
                id="ssl"
                checked={formData.ssl_enabled}
                onCheckedChange={(checked) => handleChange("ssl_enabled", checked)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          {/* Test Connection Status */}
          {testStatus && (
            <Alert
              variant={testStatus.success ? "default" : "destructive"}
              className={
                testStatus.success
                  ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 border-2"
                  : "border-2"
              }
            >
              {testStatus.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <AlertDescription
                className={
                  testStatus.success
                    ? "text-green-700 dark:text-green-400 font-medium"
                    : "font-medium"
                }
              >
                {testStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-2">
              <XCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-3 border-t pt-6 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={loading}
              className="h-11 px-6 font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={loading || !testStatus?.success}
              className="h-11 px-8 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Create Connection
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

