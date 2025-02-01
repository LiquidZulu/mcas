const {
    createAndWrite,
    dirIsMotionCanvas,
    getParentPackageJSON,
    download,
} = require('./fs.js');
const { dirname, join } = require('path');
const { mkdir, writeFile, readFile } = require('fs/promises');
const { Innertube } = require('youtubei.js');
const randomVideos = require('./const/videos.js');

module.exports.getRandomVideos = async function getRandomVideos(n) {
    const currentDir = process.cwd();
    const isMotionCanvas = await dirIsMotionCanvas(currentDir);

    // if it isn't a motion canvas directory, they are doing something very strange indeed...
    if (!isMotionCanvas) {
        throw new Error(
            '[ERROR] The current directory does not appear to be inside of a motion-canvas project, or permissions are insufficient.\n\nUnless you made your motion-canvas project in a protected folder, the latter should not be true. If you did do such a thing make sure that you know what you are doing, this software will write to .mcas/ if you give it permission to and are in a motion-canvas project.',
        );
    }

    const projectRoot = dirname(await getParentPackageJSON(currentDir));

    const dotMcas = join(projectRoot, `.mcas`);

    await mkdir(dotMcas, { recursive: true });

    const randomdbFile = join(dotMcas, `random.json`);
    await createAndWrite(randomdbFile, false);
    let randomdb = JSON.parse(await readFile(randomdbFile, 'utf8'));

    const randomN = Object.keys(randomdb).length;

    if (randomN >= n) {
        return Object.fromEntries(Object.entries(randomdb).slice(-n));
    }
    const vids = await module.exports.getVideoInformation(
        ...randomVideos
            .sort(_ => Math.random() - 0.5)
            .filter(x => !(x.id in randomdb))
            .slice(0, n - randomN),
    );

    for (let vid of vids) {
        randomdb[vid.id] = vid;
    }

    await writeFile(randomdbFile, JSON.stringify(randomdb));

    return vids;
};

module.exports.getVideoInformation = async function getVideoInformation(
    ...videos
) {
    const currentDir = process.cwd();
    const isMotionCanvas = await dirIsMotionCanvas(currentDir);

    // if it isn't a motion canvas directory, they are doing something very strange indeed...
    if (!isMotionCanvas) {
        throw new Error(
            '[ERROR] The current directory does not appear to be inside of a motion-canvas project, or permissions are insufficient.\n\nUnless you made your motion-canvas project in a protected folder, the latter should not be true. If you did do such a thing make sure that you know what you are doing, this software will write to .mcas/ if you give it permission to and are in a motion-canvas project.',
        );
    }

    const projectRoot = dirname(await getParentPackageJSON(currentDir));

    const dotMcas = join(projectRoot, `.mcas`);

    await mkdir(join(dotMcas, 'assets'), { recursive: true });

    const videodbFile = join(dotMcas, `videos.json`);
    const channeldbFile = join(dotMcas, `channels.json`);

    await createAndWrite(videodbFile, false);
    await createAndWrite(channeldbFile, false);

    let videodb = JSON.parse(await readFile(videodbFile, 'utf8'));
    let channeldb = JSON.parse(await readFile(channeldbFile, 'utf8'));

    const it = await Innertube.create();
    let requestedVideos = [];

    for (let video of videos) {
        const maybeId = video.match(/(((\?|&)v=)|(be\/))([A-z0-9\-_]{11})/g);

        if (!maybeId) {
            console.error(
                `[ERROR] could not parse URL ${video}\nEnsure that the url has a valid 11-digit alphanumeric identifier.`,
            );
        } else {
            const id = maybeId[0].substring(3);

            if (!videodb[id]) {
                let {
                    channel_id,
                    title,
                    duration,
                    short_description,
                    thumbnail,
                    view_count,
                    author,
                } = (await it.getBasicInfo(id))['basic_info'];

                const newThumbPath = join(dotMcas, '/assets/', `${id}.jpg`);
                download(thumbnail[0].url, newThumbPath);
                thumbnail = `/.mcas/assets/${id}.jpg`;

                // remove this whenever youtube.js fixes sub counts
                let subscriber_count = '';
                try {
                    subscriber_count = (
                        await (
                            await fetch(
                                'https://www.youtube.com/youtubei/v1/browse',
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        context: {
                                            client: {
                                                clientName: 'WEB',
                                                clientVersion:
                                                    '2.20231009.00.00',
                                            },
                                        },
                                        browseId: channel_id,
                                    }),
                                },
                            )
                        ).json()
                    ).header.pageHeaderRenderer.content.pageHeaderViewModel
                        .metadata.contentMetadataViewModel.metadataRows[1]
                        .metadataParts[0].text.content;
                } catch (e) {
                    console.error('[ERROR] Unable to retrieve sub count');
                }

                let { description, avatar } = (await it.getChannel(channel_id))
                    .metadata;

                const newAvatarPath = join(
                    dotMcas,
                    '/assets/',
                    `${channel_id}.jpg`,
                );
                download(avatar[0].url, newAvatarPath);
                avatar = `/.mcas/assets/${channel_id}.jpg`;

                videodb[id] = {
                    subscriber_count,
                    id,
                    channel_id,
                    title,
                    duration,
                    short_description,
                    thumbnail,
                    view_count,
                    author,
                    avatar,
                };

                channeldb[channel_id] = {
                    avatar,
                    author,
                    description,
                    subscriber_count,
                };
            }
            requestedVideos.push(videodb[id]);
        }
    }

    await writeFile(videodbFile, JSON.stringify(videodb));
    await writeFile(channeldbFile, JSON.stringify(channeldb));

    return requestedVideos;
};
