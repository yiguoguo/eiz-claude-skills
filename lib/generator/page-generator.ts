import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function generatePageFiles(outputPath: string) {
  await mkdir(join(outputPath, 'app'), { recursive: true });

  // ============================================
  // 通用页面模板
  // 支持任意数据结构，自动识别字段类型
  // ============================================
  const pageTsx = `'use client';

import { useEffect, useState, useMemo } from 'react';
import { Layout, Breadcrumb, Card, Row, Col } from 'antd';
import { useDataStore } from '@/lib/store/useDataStore';
import DataTable from '@/components/DataTable';
import ChartCard from '@/components/ChartCard';
import StatsCard from '@/components/StatsCard';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { exportToCSV } from '@/lib/export';

const { Content } = Content;

interface PageConfig {
  // 页面标题
  title?: string;
  // 面包屑
  breadcrumbs?: string[];
  // API 端点
  apiEndpoint?: string;
  // 数据字段配置
  columnConfig?: DataTable['props']['columnConfig'];
  // 统计卡片配置
  statsConfig?: Array<{
    key: string; // 数据字段名
    title: string;
    prefix?: string;
    valueFormatter?: (value: any) => string | number;
  }>;
  // 图表配置 - 指定哪些字段用于生成图表
  chartConfig?: Array<{
    title: string;
    dataKey: string; // 字段名
    chartType?: 'bar' | 'line' | 'pie';
  }>;
}

interface PageProps {
  config?: PageConfig;
}

export default function Home({ config }: PageProps) {
  const { data, loading, error, fetchData } = useDataStore();

  // 默认配置
  const pageConfig: Required<PageConfig> = {
    title: config?.title || 'Data',
    breadcrumbs: config?.breadcrumbs || ['Home', 'Data'],
    apiEndpoint: config?.apiEndpoint || '',
    columnConfig: config?.columnConfig || [],
    statsConfig: config?.statsConfig || [],
    chartConfig: config?.chartConfig || [],
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token && pageConfig.apiEndpoint) {
      fetchData(token, pageConfig.apiEndpoint);
    }
  }, [fetchData, pageConfig.apiEndpoint]);

  // 处理 CSV 导出
  const handleExport = () => {
    if (data && data.length > 0) {
      exportToCSV(data, pageConfig.title.toLowerCase().replace(/\\s+/g, '_'));
    }
  };

  // 从数据中提取统计信息
  const stats = useMemo(() => {
    if (!data || data.length === 0) return [];

    return pageConfig.statsConfig.map((stat) => {
      const values = data.map((item) => {
        const val = item[stat.key];
        return stat.valueFormatter ? stat.valueFormatter(val) : Number(val) || 0;
      });
      const total = values.reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      return { ...stat, value: total };
    });
  }, [data, pageConfig.statsConfig]);

  // 从数据中提取图表数据
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return pageConfig.chartConfig.map((chart) => {
      // 对于 pie/bar chart，聚合数据
      if (chart.chartType === 'pie') {
        const counts: Record<string, number> = {};
        data.forEach((item) => {
          const val = String(item[chart.dataKey] || 'Unknown');
          counts[val] = (counts[val] || 0) + 1;
        });
        return {
          title: chart.title,
          chartType: chart.chartType || 'bar',
          data: Object.entries(counts).map(([name, value]) => ({ name, value })),
        };
      }

      // 对于 bar/line chart，取前 10 条数据的该字段
      return {
        title: chart.title,
        chartType: chart.chartType || 'bar',
        data: data.slice(0, 10).map((item) => ({
          name: String(item[chart.dataKey] || item.id || ''),
          value: Number(item[chart.dataKey]) || 0,
        })),
      };
    });
  }, [data, pageConfig.chartConfig]);

  // Loading / Error / Empty 状态
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => fetchData(dataStore.getState().token || '')} />;
  if (!data || data.length === 0) return <EmptyState title="No Data" />;

  return (
    <div style={{ padding: 24, background: '#F5F5F5', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={pageConfig.breadcrumbs.map((item) => ({ title: item }))}
        />
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {stats.map((stat, i) => (
            <Col span={24 / Math.min(stats.length, 4)} key={i}>
              <StatsCard title={stat.title} value={stat.value} prefix={stat.prefix} />
            </Col>
          ))}
        </Row>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {chartData.map((chart, i) => (
            <Col span={12} key={i}>
              <ChartCard
                title={chart.title}
                data={chart.data}
                chartType={chart.chartType}
                height={280}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Data Table */}
      <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 0 } }}>
        <DataTable
          data={data}
          columnConfig={pageConfig.columnConfig}
          searchable
          exportable
          onExport={handleExport}
        />
      </Card>
    </div>
  );
}
`;

  // Layout with Antd ConfigProvider
  const layoutTsx = `'use client';

import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#1677FF',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F5F5',
    colorBorder: '#E8E8E8',
    colorText: '#1F1F1F',
    colorTextSecondary: '#8C8C8C',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={theme}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
`;

  const globalsCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1F1F1F;
  background: #F5F5F5;
}

a {
  color: #1677FF;
  text-decoration: none;
}
`;

  await writeFile(join(outputPath, 'app', 'page.tsx'), pageTsx);
  await writeFile(join(outputPath, 'app', 'layout.tsx'), layoutTsx);
  await writeFile(join(outputPath, 'app', 'globals.css'), globalsCss);
}
