export interface DeployResult {
    url: string;
    projectId: string;
    deployId: string;
}
export declare function deployAddon(projectPath: string, projectName: string): Promise<DeployResult>;
export declare function verifyBuild(projectPath: string): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=deployer.d.ts.map