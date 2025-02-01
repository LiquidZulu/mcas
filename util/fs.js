const { access, constants, readFile, writeFile, open } = require('fs/promises');
const { createWriteStream, existsSync } = require('fs');
const { dirname, join } = require('path');
const axios = require('axios');

module.exports.download = (url, path) => {
    if (!existsSync(path) && url) {
        console.log(url);
        axios({
            url,
            responseType: 'stream',
        }).then(
            response =>
                new Promise((resolve, reject) => {
                    response.data
                        .pipe(createWriteStream(path))
                        .on('finish', () => resolve())
                        .on('error', e => reject(e));
                }),
        );
    }
};

module.exports.createAndWrite = async function (file, logging) {
    const log = logging === false ? (..._) => {} : console.log;

    try {
        // it exists already, don't overwrite it
        await access(file);
        log('Database file already exists ', file);
    } catch (e) {
        if (e.code === 'ENOENT') {
            log('Creating file ', file);
            await open(file, 'w');

            log('Writing to ', file);
            await writeFile(file, '{}');
        } else {
            throw e;
        }
    }
};

module.exports.root = () => join(dirname(process.argv[1]), '../../');
module.exports.getParentPackageJSON = getParentPackageJSON;
async function getParentPackageJSON(dir) {
    let currentDir = dir;

    // make this recursive at some point
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const packageJsonPath = join(currentDir, 'package.json');

        try {
            await access(packageJsonPath);
            return packageJsonPath;
        } catch (e) {
            const parentDir = dirname(currentDir);
            if (parentDir == currentDir) {
                return false;
            }

            currentDir = parentDir;
        }
    }
}

module.exports.dirIsMotionCanvas = async function (dir) {
    try {
        await access(join(dir), constants.R_OK | constants.W_OK);
    } catch (e) {
        console.error(e);
        return false;
    }

    const packageJsonPath = await getParentPackageJSON(dir);

    if (packageJsonPath) {
        const packageJsonRaw = await readFile(packageJsonPath, {
            encoding: 'utf8',
        });
        const packageJson = JSON.parse(packageJsonRaw);

        if (packageJson.dependencies) {
            return (
                !!packageJson.dependencies['@motion-canvas/core'] ||
                !!packageJson.dependencies['@motion-canvas/2d']
            );
        }
    }

    return false;
};
