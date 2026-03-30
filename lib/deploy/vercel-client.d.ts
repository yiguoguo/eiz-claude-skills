export declare class VercelClient {
    private token;
    private teamId?;
    constructor();
    private getCliCredentials;
    private getEnvToken;
    private request;
    createProject(name: string): Promise<string>;
    uploadFiles(projectDir: string, projectId: string): Promise<void>;
    private gatherFiles;
    private createFileTree;
    private uploadFileContent;
    triggerDeployment(projectId: string): Promise<string>;
    pollDeployment(deployId: string): Promise<{
        status: string;
        url?: string;
    }>;
    getProjectUrl(projectId: string): Promise<string>;
}
//# sourceMappingURL=vercel-client.d.ts.map