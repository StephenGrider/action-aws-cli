export declare class DownloadExtractInstall {
    private readonly downloadUrl;
    private readonly fileType;
    constructor(downloadUrl: string);
    isAlreadyInstalled(toolName: string): Promise<boolean | string>;
    private _getVersion;
    private _getCommandOutput;
    downloadFile(): Promise<string>;
    extractFile(filePath: string): Promise<string>;
    installPackage(installCommand: string, installArgs: string[]): Promise<number>;
    cacheTool(installedBinary: string): Promise<string>;
}
