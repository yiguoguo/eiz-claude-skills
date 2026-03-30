import { ParsedAPI } from './types';
import { generateProjectFiles } from './project-generator';
import { generatePageFiles } from './page-generator';
import { generateComponents } from './component-generator';
import { generateAPIRoutes } from './api-generator';
import { generateStateManagement } from './state-generator';
import { generateConfigFile } from './config-generator';

export { ParsedAPI } from './types';

export async function generateAddonProject(
  parsed: ParsedAPI,
  outputPath: string,
  options: { name?: string }
) {
  await generateProjectFiles(outputPath, options);
  await generatePageFiles(outputPath);
  await generateComponents(outputPath);
  await generateAPIRoutes(outputPath);
  await generateStateManagement(outputPath);
  await generateConfigFile(outputPath, options);

  return {
    success: true,
    outputPath,
    files: [
      'package.json',
      'next.config.ts',
      'tsconfig.json',
      'vercel.json',
      'lib/theme.ts',
      'app/page.tsx',
      'app/layout.tsx',
      'app/globals.css',
      'app/api/data/route.ts',
      'app/api/verify/route.ts',
      'components/DataTable.tsx',
      'components/LoadingState.tsx',
      'components/ErrorState.tsx',
      'components/EmptyState.tsx',
      'components/ProductCard.tsx',
      'lib/store/useDataStore.ts',
      'lib/types.ts',
      'plugin.config.ts',
    ],
  };
}
