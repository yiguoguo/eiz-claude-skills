import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function generateComponents(outputPath: string) {
  await mkdir(join(outputPath, 'components'), { recursive: true });

  // ============================================
  // DataTable - 通用动态数据表格
  // 根据数据自动识别列类型（图片/标签/数字/文本/操作）
  // ============================================
  const dataTableTsx = `'use client';

import { Table, Input, Button, Space, Tag, Image } from 'antd';
import type { TableColumnType } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';

const { Search } = Input;

interface DataTableProps {
  data: Record<string, any>[];
  loading?: boolean;
  // 可选：自定义列配置，传入则使用自定义，否则自动识别
  columnConfig?: Array<{
    key: string;
    title?: string;
    type?: 'text' | 'image' | 'tag' | 'number' | 'currency' | 'date' | 'actions';
    sortable?: boolean;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    colorMap?: Record<string, string>; // tag 类型的颜色映射
  }>;
  searchable?: boolean;
  exportable?: boolean;
  onExport?: () => void;
}

export default function DataTable({
  data,
  loading,
  columnConfig,
  searchable = true,
  exportable = true,
  onExport,
}: DataTableProps) {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // 自动检测字段类型
  const detectFieldType = (key: string, value: any): DataTableProps['columnConfig'] extends Array<infer T> ? T['type'] : 'text' => {
    const lowerKey = key.toLowerCase();

    // 图片字段
    if (lowerKey.includes('img') || lowerKey.includes('image') || lowerKey.includes('photo') || lowerKey.includes('avatar')) {
      return 'image';
    }

    // 金额/价格字段
    if (lowerKey.includes('price') || lowerKey.includes('amount') || lowerKey.includes('total') || lowerKey.includes('cost')) {
      return 'currency';
    }

    // 数量/库存字段
    if (lowerKey.includes('qty') || lowerKey.includes('quantity') || lowerKey.includes('stock') || lowerKey.includes('count') || lowerKey.includes('num')) {
      return 'number';
    }

    // 日期字段
    if (lowerKey.includes('date') || lowerKey.includes('time') || lowerKey.includes('created') || lowerKey.includes('updated')) {
      return 'date';
    }

    // ID/状态类字段用 tag
    if (lowerKey.includes('id') || lowerKey.includes('status') || lowerKey.includes('state') || lowerKey.includes('type') || lowerKey.includes('sku')) {
      return 'tag';
    }

    return 'text';
  };

  // 自动生成列配置
  const autoColumns = useMemo<TableColumnType<Record<string, any>>[]>(() => {
    if (data.length === 0) return [];
    const firstRow = data[0];

    return Object.keys(firstRow).map((key) => {
      const value = firstRow[key];
      const fieldType = detectFieldType(key, value);

      // 格式化列名
      const title = key.replace(/_/g, ' ').replace(/\\b\\w/g, (c) => c.toUpperCase());

      const baseColumn: TableColumnType<Record<string, any>> = {
        title,
        dataIndex: key,
        key,
        width: 120,
        ellipsis: true,
      };

      switch (fieldType) {
        case 'image':
          return {
            ...baseColumn,
            title,
            width: 80,
            render: (url: string) =>
              url ? (
                <Image src={url} alt={key} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <div style={{ width: 48, height: 48, background: '#FAFAFA', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#D9D9D9', fontSize: 12 }}>N/A</span>
                </div>
              ),
          };

        case 'number':
          return {
            ...baseColumn,
            title,
            width: 100,
            align: 'right',
            sorter: (a, b) => (Number(a[key]) || 0) - (Number(b[key]) || 0),
            render: (value: number) => (
              <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
            ),
          };

        case 'currency':
          return {
            ...baseColumn,
            title,
            width: 120,
            align: 'right',
            sorter: (a, b) => (Number(a[key]) || 0) - (Number(b[key]) || 0),
            render: (value: number) => (
              <span style={{ fontFamily: 'monospace', color: '#52C41A' }}>
                {typeof value === 'number' ? \\`$\\${value.toLocaleString()}\\` : value}
              </span>
            ),
          };

        case 'date':
          return {
            ...baseColumn,
            title,
            width: 160,
            render: (date: string) => {
              if (!date) return '-';
              const d = new Date(date);
              return d instanceof Date && !isNaN(d.getTime())
                ? d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : String(date);
            },
          };

        case 'tag':
          return {
            ...baseColumn,
            title,
            width: 140,
            render: (text: string | number) => <Tag>{text}</Tag>,
          };

        default:
          return {
            ...baseColumn,
            title,
            ellipsis: true,
          };
      }
    }).concat([{
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: () => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />} title="View" />
          <Button type="text" size="small" icon={<EditOutlined />} title="Edit" />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Delete" />
        </Space>
      ),
    }]);
  }, [data]);

  // 使用自定义列配置或自动生成
  const columns = columnConfig
    ? columnConfig.map((col) => {
        const autoCol = autoColumns.find((c) => c.key === col.key || c.dataIndex === col.key);
        return {
          ...autoCol,
          ...col,
          title: col.title || autoCol?.title,
          width: col.width || autoCol?.width,
          align: col.align || autoCol?.align,
        };
      })
    : autoColumns;

  // 搜索过滤
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value) {
      const filtered = data.filter((item) =>
        Object.values(item).some((v) => String(v).toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  return (
    <div>
      {(searchable || exportable) && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E8E8E8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {searchable && (
            <Search
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: '#8C8C8C' }} />}
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              style={{ width: 280 }}
              allowClear
            />
          )}
          {exportable && (
            <Button icon={<EditOutlined />} onClick={onExport}>
              Export
            </Button>
          )}
        </div>
      )}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => \`Total \\${total} items\`,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
    </div>
  );
}
`;

  // ============================================
  // ChartCard - 通用图表组件
  // 支持柱状图、折线图、饼图，可切换类型
  // ============================================
  const chartCardTsx = `'use client';

import ReactECharts from 'echarts-for-react';
import { Segmented, Space } from 'antd';
import { useState } from 'react';

interface ChartDataItem {
  name: string;
  value: number;
}

interface ChartCardProps {
  title?: string;
  data: ChartDataItem[];
  chartType?: 'bar' | 'line' | 'pie';
  height?: number;
  showTypeSwitcher?: boolean;
  colors?: string[];
}

export default function ChartCard({
  title,
  data,
  chartType = 'bar',
  height = 300,
  showTypeSwitcher = true,
  colors = ['#1677FF', '#52C41A', '#FF4D4F', '#FAAD14', '#722ED1', '#13C2C2', '#EB2F96', '#FA8C16'],
}: ChartCardProps) {
  const [type, setType] = useState<'bar' | 'line' | 'pie'>(chartType);

  const getOption = () => {
    const palette = colors.slice(0, Math.max(data.length, 1));

    if (type === 'bar') {
      return {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: data.map((d) => d.name),
          axisLabel: { color: '#8C8C8C', fontSize: 11, rotate: data.length > 6 ? 30 : 0 },
          axisLine: { lineStyle: { color: '#E8E8E8' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#8C8C8C' },
          splitLine: { lineStyle: { color: '#F0F0F0' } },
        },
        series: [{
          type: 'bar',
          barWidth: '60%',
          data: data.map((d, i) => ({
            value: d.value,
            itemStyle: { color: palette[i % palette.length], borderRadius: [4, 4, 0, 0] },
          })),
        }],
      };
    }

    if (type === 'line') {
      return {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: data.map((d) => d.name),
          boundaryGap: false,
          axisLabel: { color: '#8C8C8C', fontSize: 11, rotate: data.length > 6 ? 30 : 0 },
          axisLine: { lineStyle: { color: '#E8E8E8' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#8C8C8C' },
          splitLine: { lineStyle: { color: '#F0F0F0' } },
        },
        series: [{
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: palette[0], width: 2 },
          areaStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
              { offset: 0, color: palette[0] + '4D' },
              { offset: 1, color: palette[0] + '0D' },
            ]},
          },
          data: data.map((d, i) => ({ value: d.value, itemStyle: { color: palette[i % palette.length] } })),
        }],
      };
    }

    // Pie chart
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: '#8C8C8C' } },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: data.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: palette[i % palette.length] } })),
      }],
    };
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        {title && <span style={{ fontWeight: 500, color: '#1F1F1F', fontSize: 14 }}>{title}</span>}
        {showTypeSwitcher && (
          <Space>
            <Segmented
              size="small"
              options={[
                { label: 'Bar', value: 'bar' },
                { label: 'Line', value: 'line' },
                { label: 'Pie', value: 'pie' },
              ]}
              value={type}
              onChange={(v) => setType(v as 'bar' | 'line' | 'pie')}
            />
          </Space>
        )}
      </div>
      <ReactECharts option={getOption()} style={{ height }} />
    </div>
  );
}
`;

  // ============================================
  // StatsCard - 统计卡片组件
  // ============================================
  const statsCardTsx = `'use client';

import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface StatsCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  valueStyle?: React.CSSProperties;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendValue,
  valueStyle,
  loading,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpOutlined style={{ color: '#52C41A' }} />;
    if (trend === 'down') return <ArrowDownOutlined style={{ color: '#FF4D4F' }} />;
    return null;
  };

  return (
    <Card size="small" style={{ borderRadius: 8 }}>
      <Statistic
        title={<span style={{ fontSize: 12, color: '#8C8C8C' }}>{title}</span>}
        value={value}
        prefix={prefix}
        suffix={suffix}
        loading={loading}
        valueStyle={{ fontWeight: 600, ...valueStyle }}
      />
      {trend && trendValue && (
        <div style={{ marginTop: 8, fontSize: 12, color: trend === 'up' ? '#52C41A' : trend === 'down' ? '#FF4D4F' : '#8C8C8C' }}>
          {getTrendIcon()} {trendValue}
        </div>
      )}
    </Card>
  );
}
`;

  // ============================================
  // LoadingState / ErrorState / EmptyState
  // ============================================
  const loadingStateTsx = `export default function LoadingState() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#F5F5F5',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="ant-spin ant-spin-lg ant-spin-spinning">
          <span className="ant-spin-dot ant-spin-dot-spin">
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
            <i className="ant-spin-dot-item"></i>
          </span>
        </div>
        <p style={{ marginTop: 16, color: '#8C8C8C' }}>Loading...</p>
      </div>
    </div>
  );
}`;

  const errorStateTsx = `import { Result, Button } from 'antd';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <Result
      status="error"
      title="Error"
      subTitle={message}
      extra={onRetry && <Button type="primary" onClick={onRetry}>Retry</Button>}
    />
  );
}`;

  const emptyStateTsx = `import { Empty } from 'antd';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ title = 'No Data', description }: EmptyStateProps) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div>
          <p style={{ color: '#8C8C8C', marginBottom: 8 }}>{title}</p>
          {description && <p style={{ color: '#8C8C8C', fontSize: 12 }}>{description}</p>}
        </div>
      }
    />
  );
}`;

  await writeFile(join(outputPath, 'components', 'DataTable.tsx'), dataTableTsx);
  await writeFile(join(outputPath, 'components', 'ChartCard.tsx'), chartCardTsx);
  await writeFile(join(outputPath, 'components', 'StatsCard.tsx'), statsCardTsx);
  await writeFile(join(outputPath, 'components', 'LoadingState.tsx'), loadingStateTsx);
  await writeFile(join(outputPath, 'components', 'ErrorState.tsx'), errorStateTsx);
  await writeFile(join(outputPath, 'components', 'EmptyState.tsx'), emptyStateTsx);
}
