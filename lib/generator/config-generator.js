import { writeFile } from 'fs/promises';
import { join } from 'path';
export async function generateConfigFile(outputPath, options) {
    const pluginConfigTs = `import type { PluginConfig } from '@/lib/types';

const config: PluginConfig = {
  name: '${options.name || 'addon-plugin'}',
  version: '0.1.0',
  description: 'Generated addon plugin',
  tokens: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      accent: 'var(--color-accent)',
      background: 'var(--color-background)',
      foreground: 'var(--color-foreground)',
      border: 'var(--color-border)',
      muted: 'var(--color-muted-foreground)',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    typography: {
      fontFamily: 'var(--font-sans)',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  features: [],
};

export default config;
`;
    const typesTs = `export interface PluginConfig {
  name: string;
  version: string;
  description?: string;
  tokens: {
    colors: Record<string, string>;
    spacing: Record<string, string>;
    typography: {
      fontFamily: string;
      fontSize: Record<string, string>;
      fontWeight: Record<string, string>;
    };
  };
  features?: string[];
}

export interface TokenContext {
  token: string;
  expiresAt?: string;
}
`;
    await writeFile(join(outputPath, 'plugin.config.ts'), pluginConfigTs);
    await writeFile(join(outputPath, 'lib', 'types.ts'), typesTs);
}
//# sourceMappingURL=config-generator.js.map