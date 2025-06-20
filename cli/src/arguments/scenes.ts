import { dirname, resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { root, dirIsMotionCanvas, getParentPackageJSON } from '../util/fs';
import { join } from 'path';

export async function handleScenes(
    names: string[],
    sceneContent?: string,
    dotMeta?: {
        version: number;
        timeEvents: { name: string; targetTime: number }[];
        seed: number;
    },
) {
    if (names.length == 0) {
        console.error(
            '[ERROR] No scene names provided.\n\tTry: mcas -s scene-1 scene-2 ...',
        );
        return;
    }

    const defaultScene =
        sceneContent ??
        (
            await readFile(
                join(root(), './cli/assets/scenes/default-scene.tsx'),
                {
                    encoding: 'utf8',
                },
            )
        )
            .split('\n')
            .slice(1)
            .join('\n');

    const currentDir = resolve('.');
    const isMotionCanvas = await dirIsMotionCanvas(currentDir);

    if (!isMotionCanvas) {
        console.error(
            '[ERROR] The current directory does not appear to be inside of a motion-canvas project, or permissions are insufficient.\n\nUnless you made your motion-canvas project in a protected folder, the latter should not be true. If you did do such a thing make sure that you know what you are doing, this software will write to src/scenes if you give it permission to and are in a motion-canvas project.',
        );
        return;
    }

    const projectRoot = dirname(
        (await getParentPackageJSON(currentDir)) as string,
    );

    for (const scene of names) {
        const sceneTsx = join(projectRoot, `src/scenes/${scene}.tsx`);
        const sceneMeta = join(projectRoot, `src/scenes/${scene}.meta`);

        console.log('Writing to ' + sceneTsx);
        try {
            const controller = new AbortController();
            const { signal } = controller;
            const data = new Uint8Array(Buffer.from(defaultScene));
            const promise = writeFile(sceneTsx, data, {
                signal,
            });
            await promise;
        } catch (e) {
            console.error(`Error writing to ${scene}.tsx:\n`, e);
        }

        console.log('Writing to ' + sceneMeta);
        try {
            const controller = new AbortController();
            const { signal } = controller;
            const data = new Uint8Array(
                Buffer.from(
                    JSON.stringify(
                        dotMeta ?? {
                            version: 0,
                            timeEvents: [],
                            seed: Math.floor(Math.random() * 4294967296), // https://github.com/motion-canvas/motion-canvas/blob/944b48fff891c2cbbcc89ccb141ec197ecda4752/packages/core/src/scenes/Random.ts#L26
                        },
                        null,
                        4,
                    ),
                ),
            );
            const promise = writeFile(sceneMeta, data, {
                signal,
            });
            await promise;
        } catch (e) {
            console.error(`Error writing to ${scene}.tsx:\n`, e);
        }
    }
}
