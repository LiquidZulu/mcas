// I don't know why this can't be a module, but whatever...
const express = require('express');
const app = express();
const { getVideoInformation, getRandomVideos } = require('./util/yt.js');

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

module.exports = function mcas() {
    return {
        name: 'mcas-vite-plugin',

        configureServer(server) {
            server.middlewares.use(app);
        },
    };
};
