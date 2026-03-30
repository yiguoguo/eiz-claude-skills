import { generateProjectFiles } from './project-generator';
import { generatePageFiles } from './page-generator';
import { generateComponents } from './component-generator';
import { generateAPIRoutes } from './api-generator';
import { generateStateManagement } from './state-generator';
import { generateConfigFile } from './config-generator';
export async function generateAddonProject(parsed, outputPath, options) {
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
            'tailwind.config.ts',
            'tsconfig.json',
            'vercel.json',
            'postcss.config.mjs',
            'app/page.tsx',
            'app/layout.tsx',
            'app/globals.css',
            'app/api/data/route.ts',
            'app/api/verify/route.ts',
            'components/DataTable.tsx',
            'components/LoadingState.tsx',
            'components/ErrorState.tsx',
            'components/EmptyState.tsx',
            'lib/store/useDataStore.ts',
            'lib/types.ts',
            'plugin.config.ts',
        ],
    };
}
//# sourceMappingURL=index.js.map