// NOTE FOR FUTURE ME
// this file is now deprecated (I think).
// The mcasVitePlugin.ts generated now has everything required.
// You didn't bother to document the process when you wrote this
// code so idk why/whether this bs used to be required or if
// motion-canvas/vite had some update or whatever that broke the
// hacky solution, but here is the current process:
// 1. mcas --init
// 2. add mcas() plugin from './mcasVitePlugin' to vite.config.ts
// 3. check environmentalism example.tsx for example.

import express from 'express';
import { getVideoInformation, getRandomVideos } from './util/yt.js';

const app = express();

app.get('/mcas', async (req, res) => {
    if ('v' in req.query) {
        const videos = await getVideoInformation(...req.query.v.split(';'));
        res.send(JSON.stringify(videos));
    }

    if ('random_videos' in req.query) {
        const videos = await getRandomVideos(Number(req.query.random_videos));
        res.send(JSON.stringify(videos));
    }
});

export default function mcas() {
    return {
        name: 'mcas-vite-plugin',
        configureServer(server) {
            server.middlewares.use(app);
        },
        apply: 'serve',
    };
}
