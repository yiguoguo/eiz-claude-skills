import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
export async function generatePageFiles(outputPath) {
    await mkdir(join(outputPath, 'app'), { recursive: true });
    const pageTsx = `'use client';

import { useEffect, useState } from 'react';
import { useDataStore } from '@/lib/store/useDataStore';
import DataTable from '@/components/DataTable';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const { data, loading, error, fetchData, setData } = useDataStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    setToken(urlToken);

    if (urlToken) {
      fetchData(urlToken);
    }
  }, [fetchData]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          title="No Token"
          description="Token is required to load data. Please provide a valid token."
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchData(token)} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          title="No Data"
          description="No data available. Try adjusting your search criteria."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Data Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Displaying {data.length} records
          </p>
        </header>
        <DataTable data={data} />
      </div>
    </div>
  );
}
`;
    const layoutTsx = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Addon Plugin',
  description: 'Generated addon plugin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
`;
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-border: #e5e7eb;
  --color-background: #ffffff;
  --color-foreground: #111827;
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-accent: #10b981;
  --color-muted-foreground: #6b7280;
  --font-sans: ui-sans-serif, system-ui, sans-serif;
}

body {
  color: var(--color-foreground);
  background: var(--color-background);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-border: #374151;
    --color-background: #111827;
    --color-foreground: #f9fafb;
    --color-primary: #60a5fa;
    --color-secondary: #9ca3af;
    --color-accent: #34d399;
    --color-muted-foreground: #9ca3af;
  }
}
`;
    await writeFile(join(outputPath, 'app', 'page.tsx'), pageTsx);
    await writeFile(join(outputPath, 'app', 'layout.tsx'), layoutTsx);
    await writeFile(join(outputPath, 'app', 'globals.css'), globalsCss);
}
//# sourceMappingURL=page-generator.js.map