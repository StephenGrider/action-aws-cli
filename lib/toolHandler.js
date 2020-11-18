"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
const tool_cache_1 = require("@actions/tool-cache");
const io_1 = require("@actions/io");
const path = __importStar(require("path"));
const util_1 = require("./util");
const io_2 = require("@actions/io");
const IS_WINDOWS = process.platform === 'win32' ? true : false;
class DownloadExtractInstall {
    constructor(downloadUrl) {
        this.downloadUrl = downloadUrl;
        this.fileType = this.downloadUrl.substr(-4);
    }
    async isAlreadyInstalled(toolName) {
        const cachePath = await tool_cache_1.find(toolName, '*');
        const systemPath = await io_1.which(toolName);
        if (cachePath)
            return cachePath;
        if (systemPath) {
            // return await this.cacheTool(systemPath) // TODO Better logic for cache addition
            return systemPath;
        }
        return false;
    }
    async _getVersion(installedBinary) {
        const versionCommandOutput = await this._getCommandOutput(installedBinary, ['--version']);
        const installedVersion = util_1._filterVersion(versionCommandOutput);
        return installedVersion;
    }
    async _getCommandOutput(commandStr, args) {
        const logFile = path.join(__dirname, 'log.txt');
        let stdErr = '';
        let stdOut = '';
        const options = {
            windowsVerbatimArguments: false,
            listeners: {
                stderr: (data) => {
                    stdErr += data.toString();
                },
                stdout: (data) => {
                    stdOut += data.toString();
                }
            }
        };
        if (IS_WINDOWS) {
            args.push('>', logFile);
            args.unshift(commandStr);
            args.unshift('/c');
            commandStr = 'cmd';
            await exec_1.exec(commandStr, args, options);
            return await util_1._readFile(logFile, {});
        }
        else {
            await exec_1.exec(commandStr, args, options);
            if (stdOut === '')
                return stdErr;
            return stdOut;
        }
    }
    async downloadFile() {
        const filePath = await tool_cache_1.downloadTool(this.downloadUrl);
        const destPath = `${filePath}${this.fileType}`;
        await io_2.mv(filePath, destPath);
        return destPath;
    }
    async extractFile(filePath) {
        const extractDir = path.dirname(filePath);
        // await extractZip(this.downloadedFile) // This command currently throws an error on linux TODO
        // Error: spawn /home/runner/work/action-aws-cli/action-aws-cli/node_modules/@actions/tool-cache/scripts/externals/unzip EACCES
        if (process.platform === 'linux') { // Workaround
            await exec_1.exec(`unzip ${filePath}`, ['-d', extractDir]);
            return extractDir;
        }
        return await tool_cache_1.extractZip(filePath, extractDir);
    }
    async installPackage(installCommand, installArgs) {
        return await exec_1.exec(installCommand, installArgs);
    }
    async cacheTool(installedBinary) {
        const installedVersion = await this._getVersion(installedBinary);
        const cachedPath = await tool_cache_1.cacheDir(path.parse(installedBinary).dir, 'aws', installedVersion);
        return cachedPath;
    }
}
exports.DownloadExtractInstall = DownloadExtractInstall;
//# sourceMappingURL=toolHandler.js.map