import { access, constants, readFile } from 'fs/promises';
import { dirname, join } from 'path';

export const root = () => join(dirname(process.argv[1]), '../../');

export async function getParentPackageJSON(
    dir: string,
): Promise<string | false> {
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

export async function dirIsMotionCanvas(dir: string): Promise<boolean> {
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
}
