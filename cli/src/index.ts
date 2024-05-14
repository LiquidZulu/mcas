import { Command } from 'commander';
import { basename, resolve } from 'path';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { getOrgQuotes, orgRichText, richTextToPango } from './util/org';
import imageSize from 'image-size';

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

      let quoteImports = '';
      let defaultExport = 'export default [';

      for (let i = 0; i < quotes.length; ++i) {
        const rich = orgRichText(quotes[i]);
        const pango = richTextToPango(rich);
        const fileName = `${outDir}/quote-${i}.png`;

        const { stderr, stdout } = await require('exec-sh').promise(
          `magick -background transparent -fill "white" -font Oswald -pointsize 32 -gravity Center -size 1080 -define pango:justify=true` +
            ` "pango:${pango}"` +
            ` ${fileName}`,
        );

        if (!!stderr) throw new Error(stderr);

        console.log(stdout);

        const { height, width } = imageSize(fileName);

        quoteImports += `import { default as quote${i} } from './quote-${i}.png';\n`;
        defaultExport += `\n\t{ image: quote${i}, width: ${width}, height: ${height} },`;
      }

      console.log(`Quotes for ${basename(file)} in ${resolve(outDir)}`);

      defaultExport += `\n];`;
      await writeFile(
        resolve(outDir, 'index.ts'),
        quoteImports + '\n\n' + defaultExport,
      );
    }
  });

cli.parseAsync(process.argv);
