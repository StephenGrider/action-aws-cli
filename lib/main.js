"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core/lib/core");
const toolHandler_1 = require("./toolHandler");
const path = __importStar(require("path"));
const IS_WINDOWS = process.platform === 'win32' ? true : false;
async function _installTool() {
    const downloadUrl = IS_WINDOWS ? 'https://s3.amazonaws.com/aws-cli/AWSCLISetup.exe' : 'https://s3.amazonaws.com/aws-cli/awscli-bundle.zip';
    const tool = new toolHandler_1.DownloadExtractInstall(downloadUrl);
    const isInstalled = await tool.isAlreadyInstalled('aws');
    if (typeof isInstalled === 'string') {
        console.log('Already installed but ignoring', isInstalled);
        // TODO Figure out what is best to do when already found
        // return isInstalled
    }
    let installFilePath = await tool.downloadFile();
    const rootPath = path.parse(installFilePath).dir;
    const installDestinationDir = IS_WINDOWS ? 'C:\\PROGRA~1\\Amazon\\AWSCLI' : path.join(rootPath, '.local', 'lib', 'aws');
    const installArgs = IS_WINDOWS ? ['/install', '/quiet', '/norestart'] : ['-i', installDestinationDir];
    const binFile = IS_WINDOWS ? 'aws.exe' : 'aws';
    const installedBinary = path.join(installDestinationDir, 'bin', binFile);
    if (path.parse(installFilePath).ext === '.zip') {
        const extractedPath = await tool.extractFile(installFilePath);
        installFilePath = path.join(extractedPath, 'awscli-bundle', 'install');
    }
    await tool.installPackage(installFilePath, installArgs);
    const toolCachePath = await tool.cacheTool(installedBinary);
    await core_1.addPath(toolCachePath);
    return toolCachePath;
}
exports._installTool = _installTool;
// if (process.env.NODE_ENV != 'test') (async () => await _installTool())()
//# sourceMappingURL=main.js.map