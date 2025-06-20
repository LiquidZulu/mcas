import { basename, dirname, extname, format, resolve, parse } from 'path';
import { dirIsMotionCanvas, getParentPackageJSON } from '../util/fs';
import { exec as execSync, spawn } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { unicodeHash } from '../../../lib/util/hash';
import { handleScenes } from './scenes';

type WhisperModels = 'tiny' | 'base' | 'small' | 'medium' | 'large' | 'turbo';
type WhisperWord = {
    word: string;
    start: number;
    end: number;
    probability: number;
};

export async function handleTranscript(
    sceneName: string,
    transcriptInput?: string,
    model?: WhisperModels,
) {
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

    const tempDir = resolve(projectRoot, '.mcas');

    const input =
        transcriptInput ?? resolve(projectRoot, 'src/assets/video.wav');

    const transcript = chunkTranscript(
        (await whisper(input, tempDir, model)).flatMap(({ words }) => words),
        25,
    );

    let transcriptAtoms = '';
    let timeEvents: { name: string; targetTime: number }[] = [];

    for (let line of transcript) {
        const lineStr = lineToText(line);
        transcriptAtoms += `    <Txt {...subtitlesProps}>${lineStr}</Txt>,\n`;

        const hash = unicodeHash(lineStr);

        for (const { word, start } of line) {
            timeEvents.push({
                name: `${word.trim()} | ${hash}`,
                targetTime: start,
            });
        }
    }

    const scene = `\
import { makeScene2D, Rect, Ray, Img, Video } from "@motion-canvas/2d";
import {
  all,
  chain,
  waitFor,
  createRef,
  createRefArray,
  createSignal,
} from "@motion-canvas/core";
import {
  McasTxt as Txt,
  popin,
  popout,
  fadein,
  fadeout,
  mkSubtitles,
  TranscriptAtom,
  subtitlesProps,
} from "mcas";
import * as colors from "mcas/colors";
import video from "${format({ ...parse(input), base: '', ext: '.mp4' })}";

export default makeScene2D(function* (view) {
  view.add(<Video zIndex={-999} src={video} play />);

  yield* mkSubtitles(view, [
${transcriptAtoms}  ] as TranscriptAtom[]);
});`;

    const dotMeta = {
        version: 0,
        timeEvents,
        seed: Math.floor(Math.random() * 4294967296), // https://github.com/motion-canvas/motion-canvas/blob/944b48fff891c2cbbcc89ccb141ec197ecda4752/packages/core/src/scenes/Random.ts#L26
    };

    handleScenes([sceneName], scene, dotMeta);
}

const lineToText = (line: WhisperWord[]) =>
    line
        .map(({ word }) => word)
        .join('')
        .trim();

function chunkTranscript(transcript: WhisperWord[], maxLength: number) {
    let chunks: WhisperWord[][] = [];
    let currentChunk: WhisperWord[] = [];

    for (const word of transcript) {
        const currentLength = chunkLength(currentChunk);

        if (currentLength + word.word.length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = [];
        }

        currentChunk.push(word);
    }

    chunks.push(currentChunk);
    return chunks;
}

function chunkLength(chunk: WhisperWord[]): number {
    let len = 0;

    for (const { word } of chunk) {
        len += word.length;
    }

    return len;
}

async function whisper(
    audioFilePath: string,
    outDir: string,
    model?: WhisperModels,
): Promise<
    {
        id: number;
        seek: number;
        start: number;
        end: number;
        text: string;
        tokens: number[];
        temperature: number;
        avg_logprob: number;
        compression_ratio: number;
        no_speech_prob: number;
        words: WhisperWord[];
    }[]
> {
    return new Promise((res, rej) => {
        try {
            // Define the output JSON file path
            const baseName = basename(audioFilePath, extname(audioFilePath));
            const outputJsonPath = resolve(dirname(outDir), `${baseName}.json`);

            // Construct the Whisper command
            const command = 'whisper';
            const args = [
                audioFilePath,
                '--model',
                model ?? 'turbo',
                '--language',
                'en',
                '--output_format',
                'json',
                '--word_timestamps',
                'True',
                '--output_dir',
                dirname(outDir),
            ];

            // Spawn the Whisper process
            console.log(command + ' ' + args.join(' '));
            const whisperProcess = spawn(command, args);

            // Stream stdout for real-time feedback
            whisperProcess.stdout.on('data', data => {
                process.stdout.write(data.toString()); // Display stdout (e.g., [00:00.000 --> 00:03.680] ...)
            });

            // Stream stderr for debugging or progress (Whisper often outputs progress to stderr)
            whisperProcess.stderr.on('data', data => {
                process.stderr.write(data.toString()); // Display stderr (e.g., progress messages)
            });

            // Handle process exit
            whisperProcess.on('close', async code => {
                if (code !== 0) {
                    return rej(
                        new Error(`Whisper process exited with code ${code}`),
                    );
                }

                try {
                    // Read the JSON file
                    const jsonContent = await readFile(outputJsonPath, 'utf8');
                    const transcription = JSON.parse(jsonContent);

                    // Delete the JSON file to clean up
                    await unlink(outputJsonPath);

                    // Resolve with transcription segments
                    res(transcription.segments);
                } catch (error) {
                    rej(
                        new Error(
                            `Error processing JSON file: ${error.message}`,
                        ),
                    );
                }
            });

            // Handle process errors
            whisperProcess.on('error', error => {
                rej(
                    new Error(
                        `Failed to spawn Whisper process: ${error.message}`,
                    ),
                );
            });
        } catch (error) {
            rej(error);
        }
    });
}
