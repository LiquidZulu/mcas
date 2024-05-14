import { Command } from 'commander';
import { basename, resolve } from 'path';
import { readFile, mkdir } from 'fs/promises';
import { getOrgQuotes, orgRichText } from './util/org';

/* eslint-disable */
const version = require('../../package.json').version;

const cli = new Command();

cli
  .name('mcas')
  .description('Motion Canvas Asset Set')
  .version(version)
  .addHelpText(
    'after',
    `

Examples:
  mcas -q ./script.org  generate quotes from the provided orgmode file.`,
  )
  .showHelpAfterError();

function richTextToPango(richText) {
  let pango = '';

  for (let chunk of richText) {
    pango += `${chunk.effects.map(x => `<${x}>`).join('')}${
      chunk.text
    }${chunk.effects
      .reverse()
      .map(x => `</${x}>`)
      .join('')}`;
  }

  return pango;
}

cli
  .argument(
    '[filenames...]',
    'The filenames to perform the specified operation on.',
  )
  .option('-q, --quotes', 'Generate quotes from provided files.')
  .action(async (filenames, options) => {
    for (let file of filenames.map(x => resolve(x))) {
      const data = await readFile(file, { encoding: 'utf8' });
      const quotes = getOrgQuotes(data);
      const outDir = basename(file) + '-quotes';

      await mkdir(outDir, { recursive: true });

      mkdir;

      for (let i = 0; i < quotes.length; ++i) {
        const rich = orgRichText(quotes[i]);
        const pango = richTextToPango(rich);

        const { stderr, stdout } = await require('exec-sh').promise(
          'magick -background transparent -fill "white" -font Oswald -pointsize 32 -gravity Center -size 1080 -define pango:justify=true' +
            ` "pango:${pango}"` +
            ` ${outDir}/quote-${i}.png`,
        );

        if (!!stderr) throw new Error(stderr);

        console.log(stdout);
      }

      console.log(`Quotes for ${basename(file)} in ${resolve(outDir)}`);
    }
  });

cli.parseAsync(process.argv);

/*
magick \
  -background transparent \
  -fill "white" \
  -font Oswald \
  -pointsize 32 \
  -gravity Center \
  -size 1080 \
  "pango:There is <b>bold</b> <i>itallic</i> and <b><i>both</i></b>" \
  test.png
 */
