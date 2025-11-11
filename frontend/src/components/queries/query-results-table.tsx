/**
 * Component to display query results in a table
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface QueryResultsTableProps {
  columns: string[];
  data: Record<string, any>[];
}

export function QueryResultsTable({ columns, data }: QueryResultsTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No results found
      </div>
    );
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column}`} className="font-mono text-sm">
                    {formatValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-muted px-4 py-2 text-sm text-muted-foreground border-t">
        Showing {data.length} {data.length === 1 ? "row" : "rows"}
      </div>
    </div>
  );
}

