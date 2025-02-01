import { Command } from 'commander';
import { version } from '../../package.json';

import { init, handleQuotes, handleScenes, handleVideo } from './arguments';

const cli = new Command();

cli.name('mcas')
    .description('Motion Canvas Asset Set')
    .version(version)
    .addHelpText(
        'after',
        `

Examples:
  mcas -q ./script.org              generate quotes from the provided orgmode file.
  mcas -s foobar                    generate a scene called "foobar" in src/scenes.
  mcas -v https://youtu.be/VIDEO_ID extract the video metadata to src/.mcas`,
    )
    .showHelpAfterError();

cli.argument('[rest...]', 'The data to perform the specified operation upon.')
    .option('--init', 'Initialise MCAS in the current project.')
    .option('-q, --quotes', 'Generate quotes from provided files.')
    .option(
        '-s, --scenes',
        'Generate scene[s] with the provided names in src/scenes.',
    )
    .option(
        '-v, --video-metadata',
        'Extract video metadata for the provided url[s]',
    )
    .action(async (rest, options) => {
        if (options.init) {
            await init();
            return;
        }

        if (options.quotes) {
            await handleQuotes(rest);
            return;
        }

        if (options.scenes) {
            await handleScenes(rest);
            return;
        }

        if (options.videoMetadata) {
            await handleVideo(rest);
            return;
        }

        cli.help();
    });

cli.parseAsync(process.argv);
