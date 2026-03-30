import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function generateProjectFiles(outputPath: string, options: { name?: string }) {
  const projectName = options.name || 'addon-project';

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      next: '^14.2.0',
      react: '^18.3.0',
      'react-dom': '^18.3.0',
      antd: '^5.13.0',
      '@ant-design/icons': '^5.2.6',
      zustand: '^4.5.0',
      axios: '^1.6.5',
      dayjs: '^1.11.10'
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      typescript: '^5.4.0'
    }
  };

  const nextConfigTs = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
`;

  const tsconfigJson = {
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: { '@/*': ['./*'] }
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules']
  };

  const vercelJson = {
    buildCommand: 'npm run build',
    outputDirectory: '.next',
    framework: 'nextjs'
  };

  // Antd theme token - Ant Design 风格设计系统
  const themeConfigTs = `export const theme = {
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
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
  components: {
    Table: {
      headerBg: '#FAFAFA',
      headerColor: '#8C8C8C',
      rowHoverBg: '#FAFAFA',
      borderColor: '#E8E8E8',
    },
    Card: {
      paddingLG: 20,
    },
  },
};
`;

  await mkdir(join(outputPath, 'app', 'api', 'data'), { recursive: true });
  await mkdir(join(outputPath, 'app', 'api', 'verify'), { recursive: true });
  await mkdir(join(outputPath, 'components'), { recursive: true });
  await mkdir(join(outputPath, 'lib'), { recursive: true });

  await writeFile(join(outputPath, 'package.json'), JSON.stringify(packageJson, null, 2));
  await writeFile(join(outputPath, 'next.config.ts'), nextConfigTs);
  await writeFile(join(outputPath, 'tsconfig.json'), JSON.stringify(tsconfigJson, null, 2));
  await writeFile(join(outputPath, 'vercel.json'), JSON.stringify(vercelJson, null, 2));
  await writeFile(join(outputPath, 'lib', 'theme.ts'), themeConfigTs);
}
