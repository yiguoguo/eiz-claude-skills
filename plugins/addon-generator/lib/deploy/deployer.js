import { execSync } from 'child_process';
import { VercelClient } from './vercel-client';
export async function deployAddon(projectPath, projectName) {
    // 1. verifyBuild
    const buildResult = await verifyBuild(projectPath);
    if (!buildResult.success) {
        throw new Error(`Build verification failed: ${buildResult.error}`);
    }
    // 2. Create Vercel client and project
    const client = new VercelClient();
    const projectId = await client.createProject(projectName);
    // 3. Upload files
    await client.uploadFiles(projectPath, projectId);
    // 4. Trigger deployment
    const deployId = await client.triggerDeployment(projectId);
    // 5. Poll until READY
    const finalStatus = await pollDeployment(client, deployId);
    // 6. Get project URL
    const url = finalStatus.url || `https://${projectName}.vercel.app`;
    return { url, projectId, deployId };
}
async function pollDeployment(client, deployId) {
    const maxAttempts = 60;
    const intervalMs = 5000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const status = await client.pollDeployment(deployId);
        if (status.status === 'READY' || status.status === 'ERROR' || status.status === 'CANCELED') {
            return status;
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    return { status: 'TIMEOUT' };
}
export async function verifyBuild(projectPath) {
    try {
        // npm install
        execSync('npm install', {
            cwd: projectPath,
            stdio: 'pipe',
            timeout: 300000, // 5 minutes
        });
        // npm run build
        execSync('npm run build', {
            cwd: projectPath,
            stdio: 'pipe',
            timeout: 300000, // 5 minutes
        });
        return { success: true };
    }
    catch (error) {
        const stderr = error.stderr?.toString() || error.message || 'Unknown error';
        return {
            success: false,
            error: stderr,
        };
    }
}
//# sourceMappingURL=deployer.js.map