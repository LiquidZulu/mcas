import { readFile, writeFile } from 'fs/promises';
import { dirIsMotionCanvas, getParentPackageJSON } from '../util/fs';
import { dirname, join } from 'path';

export async function init() {
    const currentDir = process.cwd();
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

    await writeFile(
        join(projectRoot, 'mcasVitePlugin.ts'),
        `\
import { Plugin, PLUGIN_OPTIONS } from "@motion-canvas/vite-plugin";

export default function mcas(): Plugin {
  return {
    name: "mcas-vite-plugin",

    [PLUGIN_OPTIONS]: {
      entryPoint: "mcas/plugin",
      runtimeConfig: () => ({
        cwd: process.cwd(),
      }),
    },
  };
}`,
    );
}
