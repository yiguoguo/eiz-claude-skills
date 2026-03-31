import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';

export class VercelClient {
  private token: string;
  private teamId?: string;

  constructor() {
    const cliToken = this.getCliCredentials();
    this.token = cliToken || this.getEnvToken();
    if (!this.token) {
      throw new Error('No Vercel credentials found. Please run `vercel login` or set VERCEL_API_TOKEN environment variable.');
    }
  }

  private getCliCredentials(): string | null {
    try {
      const credentialsPath = join(homedir(), '.vercel', 'credentials.json');
      if (existsSync(credentialsPath)) {
        const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
        // Find the first credential with a token
        if (Array.isArray(credentials)) {
          for (const cred of credentials) {
            if (cred.token) {
              this.teamId = cred.teamId;
              return cred.token;
            }
          }
        }
      }
    } catch {
      // Fall through to environment variable
    }
    return null;
  }

  private getEnvToken(): string {
    const token = process.env.VERCEL_API_TOKEN;
    if (!token) {
      throw new Error('VERCEL_API_TOKEN environment variable is not set');
    }
    return token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `https://api.vercel.com${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vercel API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async createProject(name: string): Promise<string> {
    try {
      const result = await this.request<{ project: { id: string } }>('/v9/projects', {
        method: 'POST',
        body: JSON.stringify({
          name,
          framework: null,
          buildCommand: 'npm run build',
          outputDirectory: 'dist',
        }),
      });
      return result.project.id;
    } catch (error: any) {
      // Project might already exist, try to get it
      if (error.message.includes('already exists')) {
        const existing = await this.request<{ project: { id: string } }>(`/v9/projects/${name}`);
        return existing.project.id;
      }
      throw error;
    }
  }

  async uploadFiles(projectDir: string, projectId: string): Promise<void> {
    // Get files to upload
    const files = await this.gatherFiles(projectDir);

    // Create a file tree for Vercel
    const fileTree = await this.createFileTree(files, projectDir);

    // Get upload URLs for each file
    const uploadResult = await this.request<{ fileIds: Record<string, string> }>(`/v4/files`, {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        files: fileTree,
      }),
    });

    // Upload each file
    for (const file of files) {
      const fileId = uploadResult.fileIds[file.path];
      if (fileId) {
        await this.uploadFileContent(file.path, fileId, file.content);
      }
    }
  }

  private async gatherFiles(dir: string): Promise<{ path: string; content: Buffer }[]> {
    const files: { path: string; content: Buffer }[] = [];
    const { execSync } = require('child_process');

    // Use tar to list all files
    const output = execSync(`cd "${dir}" && find . -type f ! -path './node_modules/*' ! -path './.git/*' ! -path './.vercel/*'`, {
      encoding: 'binary',
    });

    const filePaths = output.trim().split('\n').filter(Boolean);
    const { readFileSync } = require('fs');

    for (const filePath of filePaths) {
      const cleanPath = filePath.startsWith('./') ? filePath.slice(2) : filePath;
      try {
        const content = readFileSync(join(dir, cleanPath));
        files.push({ path: cleanPath, content });
      } catch {
        // Skip unreadable files
      }
    }

    return files;
  }

  private async createFileTree(files: { path: string; content: Buffer }[], baseDir: string): Promise<{ file: string; sha: string; size: number }[]> {
    const crypto = require('crypto');
    return files.map(file => ({
      file: file.path,
      sha: crypto.createHash('sha256').update(file.content).digest('hex'),
      size: file.content.length,
    }));
  }

  private async uploadFileContent(path: string, fileId: string, content: Buffer): Promise<void> {
    const crypto = require('crypto');
    const sha = crypto.createHash('sha256').update(content).digest('hex');

    await this.request(`/v2/files/${sha}`, {
      method: 'POST',
      body: content,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': content.length.toString(),
        'x-now-digest': sha,
        'x-now-size': content.length.toString(),
      },
    });
  }

  async triggerDeployment(projectId: string): Promise<string> {
    const result = await this.request<{ deployment: { id: string } }>(`/v13/deployments`, {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        target: 'production',
      }),
    });
    return result.deployment.id;
  }

  async pollDeployment(deployId: string): Promise<{ status: string; url?: string }> {
    const result = await this.request<{
      readyState: string;
      url?: string;
    }>(`/v13/deployments/${deployId}`);

    return {
      status: result.readyState,
      url: result.url,
    };
  }

  async getProjectUrl(projectId: string): Promise<string> {
    const result = await this.request<{ project: { url: string } }>(`/v9/projects/${projectId}`);
    return result.project.url;
  }
}
