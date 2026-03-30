import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
export async function generateComponents(outputPath) {
    await mkdir(join(outputPath, 'components'), { recursive: true });
    const dataTableTsx = `'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

interface DataTableProps {
  data: Record<string, unknown>[];
}

export default function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key.replace(/_/g, ' ').replace(/\\b\\w/g, (c) => c.toUpperCase()),
      cell: ({ getValue }) => (
        <span className="text-sm text-foreground">{String(getValue())}</span>
      ),
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span>{header.column.getIsSorted() === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={cn(
              'px-3 py-1.5 text-sm border border-border rounded-md transition-colors',
              'bg-background text-foreground hover:bg-muted',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn(
              'px-3 py-1.5 text-sm border border-border rounded-md transition-colors',
              'bg-background text-foreground hover:bg-muted',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
`;
    const loadingStateTsx = `export default function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-6 w-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ))}
          </div>
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-10 w-full bg-muted animate-pulse rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
    const errorStateTsx = `interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mt-2">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
`;
    const emptyStateTsx = `interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
}
`;
    await writeFile(join(outputPath, 'components', 'DataTable.tsx'), dataTableTsx);
    await writeFile(join(outputPath, 'components', 'LoadingState.tsx'), loadingStateTsx);
    await writeFile(join(outputPath, 'components', 'ErrorState.tsx'), errorStateTsx);
    await writeFile(join(outputPath, 'components', 'EmptyState.tsx'), emptyStateTsx);
}
//# sourceMappingURL=component-generator.js.map