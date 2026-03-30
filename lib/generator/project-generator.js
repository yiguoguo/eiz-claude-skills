import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
export async function generateProjectFiles(outputPath, options) {
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
            zustand: '^4.5.0',
            '@tanstack/react-table': '^8.17.0',
            'clsx': '^2.1.0',
            'tailwind-merge': '^2.3.0'
        },
        devDependencies: {
            '@types/node': '^20.0.0',
            '@types/react': '^18.3.0',
            '@types/react-dom': '^18.3.0',
            autoprefixer: '^10.4.19',
            postcss: '^8.4.38',
            tailwindcss: '^3.4.3',
            typescript: '^5.4.0'
        }
    };
    const nextConfigTs = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
`;
    const tailwindConfigTs = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
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
    const postcssConfig = {
        plugins: {
            tailwindcss: {},
            autoprefixer: {}
        }
    };
    await mkdir(join(outputPath, 'app', 'api', 'data'), { recursive: true });
    await mkdir(join(outputPath, 'app', 'api', 'verify'), { recursive: true });
    await mkdir(join(outputPath, 'components'), { recursive: true });
    await mkdir(join(outputPath, 'lib'), { recursive: true });
    await writeFile(join(outputPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    await writeFile(join(outputPath, 'next.config.ts'), nextConfigTs);
    await writeFile(join(outputPath, 'tailwind.config.ts'), tailwindConfigTs);
    await writeFile(join(outputPath, 'tsconfig.json'), JSON.stringify(tsconfigJson, null, 2));
    await writeFile(join(outputPath, 'vercel.json'), JSON.stringify(vercelJson, null, 2));
    await writeFile(join(outputPath, 'postcss.config.mjs'), JSON.stringify(postcssConfig, null, 2));
}
//# sourceMappingURL=project-generator.js.map