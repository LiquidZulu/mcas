import { dirname, join } from 'path';
import { mkdir, open, writeFile, readFile } from 'fs/promises';
import {
    createAndWrite,
    dirIsMotionCanvas,
    getParentPackageJSON,
} from '../util/fs';
import { Innertube } from 'youtubei.js';
const it = await Innertube.create();

export async function handleVideo(videos: string[]) {
    const currentDir = process.cwd();
    const isMotionCanvas = await dirIsMotionCanvas(currentDir);

    if (!isMotionCanvas) {
        console.error(
            '[ERROR] The current directory does not appear to be inside of a motion-canvas project, or permissions are insufficient.\n\nUnless you made your motion-canvas project in a protected folder, the latter should not be true. If you did do such a thing make sure that you know what you are doing, this software will write to src/.mcas if you give it permission to and are in a motion-canvas project.',
        );
        return;
    }

    const projectRoot = dirname(
        (await getParentPackageJSON(currentDir)) as string,
    );

    const dotMcas = join(projectRoot, `src/.mcas`);

    console.log('Creating directory ', dotMcas);
    await mkdir(dotMcas, { recursive: true });

    const videodbFile = join(dotMcas, `videos.json`);
    const channeldbFile = join(dotMcas, `channels.json`);

    await createAndWrite(videodbFile);
    await createAndWrite(channeldbFile);

    let videodb = JSON.parse(await readFile(videodbFile, 'utf8'));
    let channeldb = JSON.parse(await readFile(channeldbFile, 'utf8'));

    for (let video of videos) {
        console.log('Parsing video ', video);
        const maybeId = video.match(/(((\?|&)v=)|(be\/))([A-z0-9\-_]{11})/g);

        if (!maybeId) {
            console.error(
                `[ERROR] could not parse URL ${video}\nEnsure that the url has a valid 11-digit alphanumeric identifier.`,
            );
        } else {
            const id = maybeId[0].substring(3);

            if (videodb[id]) {
                console.log(
                    `"${videodb[id].title}" already saved to database! Delete this entry if you want to save it again.`,
                );
            } else {
                const {
                    channel_id,
                    title,
                    duration,
                    short_description,
                    thumbnail,
                    view_count,
                    author,
                } = (await it.getBasicInfo(id))['basic_info'];

                const avatar = (await it.getChannel(channel_id)).metadata
                    .avatar;

                videodb[id] = {
                    channel_id,
                    title,
                    duration,
                    short_description,
                    thumbnail,
                    view_count,
                    author,
                };

                channeldb[channel_id] = {
                    avatar,
                    author,
                };
            }
        }
    }

    console.log('Writing video DB...');
    await writeFile(videodbFile, JSON.stringify(videodb));

    console.log('Writing channel DB...');
    await writeFile(channeldbFile, JSON.stringify(channeldb));

    console.log('Done!');
}
