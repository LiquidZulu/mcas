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
import { Plugin } from "@motion-canvas/vite-plugin";
import express from "express";
import { getVideoInformation, getRandomVideos } from "mcas/util/yt.js";

const app = express();

app.get("/mcas", async (req, res) => {
  if ("v" in req.query) {
    const videos = await getVideoInformation(...req.query.v.split(";"));
    res.send(JSON.stringify(videos));
  }

  if ("random_videos" in req.query) {
    const videos = await getRandomVideos(Number(req.query.random_videos));
    res.send(JSON.stringify(videos));
  }
});

export default function mcas(): Plugin {
  return {
    name: "mcas-vite-plugin",
    apply: "serve", // Only run during dev server
    configureServer(server) {
      server.middlewares.use(app);
    },
    // Remove entryPoint to avoid client-side import
    // Optionally keep runtimeConfig if needed by Motion Canvas
    [Symbol.for("motion-canvas:plugin-options")]: {
      runtimeConfig: () => ({
        cwd: process.cwd(),
      }),
    },
  };
}`,
    );
}
