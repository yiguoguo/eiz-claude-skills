import { parseAPI } from './parser/index.js';
import { deployAddon } from './deploy/deployer.js';

export interface RunAddonSkillResult {
  projectPath: string;
  vercelUrl?: string;
}

export async function runAddonSkill(
  input: string,
  options: { deploy?: boolean; name?: string }
): Promise<RunAddonSkillResult> {
  const projectName = options.name || 'addon-project';
  const projectPath = `/tmp/${projectName}`;

  // 解析输入 - 提取 API 结构供 AI 参考
  const parsed = await parseAPI(input);

  // AI 根据 parsed 结果和 SKILL.md 中的风格约束自行生成所有文件
  // lib 不预生成任何组件/页面/路由，完全由 AI 自由发挥

  let vercelUrl: string | undefined;
  if (options.deploy) {
    const deployResult = await deployAddon(projectPath, projectName);
    vercelUrl = deployResult.url;
  }

  return { projectPath, vercelUrl };
}
