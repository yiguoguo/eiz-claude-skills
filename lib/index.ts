import { parseAPI } from './parser/index.js';
import { generateAddonProject } from './generator/index.js';
import { deployAddon } from './deploy/deployer.js';

export interface RunAddonSkillResult {
  projectPath: string;
  vercelUrl?: string;
  files: string[];
}

export async function runAddonSkill(
  input: string,
  options: { deploy?: boolean; name?: string }
): Promise<RunAddonSkillResult> {
  // 1. Parse the API input
  const parsed = await parseAPI(input);

  // 2. Generate the addon project
  const projectName = options.name || parsed.name || 'addon-project';
  const generatedPath = `/tmp/${projectName}`;

  // The parser and generator have different ParsedAPI types,
  // so we need to map between them
  const generatorInput = {
    name: projectName,
    endpoints: parsed.endpoints.map((ep: any) => ({
      method: (ep.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: ep.path || '/',
      summary: ep.description || '',
      params: (ep.parameters || []).map((p: any) => ({
        name: p.name,
        in: p.in || 'query',
        type: p.type || 'string',
        required: p.required || false,
        description: p.description,
      })),
      response: { contentType: 'application/json', statusCode: 200 },
    })),
    auth: { type: 'none' as const },
    models: [],
  };

  const generated = await generateAddonProject(generatorInput as any, generatedPath, options);

  // 3. Deploy if requested
  let vercelUrl: string | undefined;
  if (options.deploy) {
    const deployResult = await deployAddon(generatedPath, projectName);
    vercelUrl = deployResult.url;
  }

  return {
    projectPath: generatedPath,
    vercelUrl,
    files: generated.files,
  };
}
