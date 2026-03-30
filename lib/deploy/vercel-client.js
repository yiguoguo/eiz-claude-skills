import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
export class VercelClient {
    token;
    teamId;
    constructor() {
        const cliToken = this.getCliCredentials();
        this.token = cliToken || this.getEnvToken();
        if (!this.token) {
            throw new Error('No Vercel credentials found. Please run `vercel login` or set VERCEL_API_TOKEN environment variable.');
        }
    }
    getCliCredentials() {
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
        }
        catch {
            // Fall through to environment variable
        }
        return null;
    }
    getEnvToken() {
        const token = process.env.VERCEL_API_TOKEN;
        if (!token) {
            throw new Error('VERCEL_API_TOKEN environment variable is not set');
        }
        return token;
    }
    async request(endpoint, options = {}) {
        const url = `https://api.vercel.com${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        const response = await fetch(url, {
            ...options,
            headers,
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Vercel API error: ${response.status} - ${error}`);
        }
        return response.json();
    }
    async createProject(name) {
        try {
            const result = await this.request('/v9/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    framework: null,
                    buildCommand: 'npm run build',
                    outputDirectory: 'dist',
                }),
            });
            return result.project.id;
        }
        catch (error) {
            // Project might already exist, try to get it
            if (error.message.includes('already exists')) {
                const existing = await this.request(`/v9/projects/${name}`);
                return existing.project.id;
            }
            throw error;
        }
    }
    async uploadFiles(projectDir, projectId) {
        // Get files to upload
        const files = await this.gatherFiles(projectDir);
        // Create a file tree for Vercel
        const fileTree = await this.createFileTree(files, projectDir);
        // Get upload URLs for each file
        const uploadResult = await this.request(`/v4/files`, {
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
    async gatherFiles(dir) {
        const files = [];
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
            }
            catch {
                // Skip unreadable files
            }
        }
        return files;
    }
    async createFileTree(files, baseDir) {
        const crypto = require('crypto');
        return files.map(file => ({
            file: file.path,
            sha: crypto.createHash('sha256').update(file.content).digest('hex'),
            size: file.content.length,
        }));
    }
    async uploadFileContent(path, fileId, content) {
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
    async triggerDeployment(projectId) {
        const result = await this.request(`/v13/deployments`, {
            method: 'POST',
            body: JSON.stringify({
                projectId,
                target: 'production',
            }),
        });
        return result.deployment.id;
    }
    async pollDeployment(deployId) {
        const result = await this.request(`/v13/deployments/${deployId}`);
        return {
            status: result.readyState,
            url: result.url,
        };
    }
    async getProjectUrl(projectId) {
        const result = await this.request(`/v9/projects/${projectId}`);
        return result.project.url;
    }
}
//# sourceMappingURL=vercel-client.js.map