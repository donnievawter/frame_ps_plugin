const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

const pluginFolder = '/Users/donaldvawter/OneDrive/frame_ps_plugin'; // Adjust this path
const outputFilePath = '/Users/donaldvawter/OneDrive/framepluginpackage/fb46891e_PS.ccx'; // Adjust this path
const excludedFolders = ['.git', '.vscode'];

async function packagePlugin() {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log(`Plugin has been packaged: ${archive.pointer()} total bytes`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    const files = await fs.readdir(pluginFolder);

    for (const file of files) {
        if (!excludedFolders.includes(file)) {
            const filePath = path.join(pluginFolder, file);
            if (fs.statSync(filePath).isDirectory()) {
                archive.directory(filePath, file);
            } else {
                archive.file(filePath, { name: file });
            }
        }
    }

    await archive.finalize();
}

packagePlugin().catch(err => console.error(err));
