import { Command } from 'commander';
import { basename, resolve } from 'path';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { getOrgQuotes, orgRichText, richTextToPango } from './util/org';

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

        const { stderr, stdout } = await require('exec-sh').promise(
          'magick -background transparent -fill "white" -font Oswald -pointsize 32 -gravity Center -size 1080 -define pango:justify=true' +
            ` "pango:${pango}"` +
            ` ${outDir}/quote-${i}.png`,
        );

        if (!!stderr) throw new Error(stderr);

        console.log(stdout);

        quoteImports += `import { default as quote${i} } from './quote-${i}.png';\n`;
        defaultExport += `\n\tquote${i},`;
      }

      console.log(`Quotes for ${basename(file)} in ${resolve(outDir)}`);

      defaultExport += `\n];`;
      //console.log(resolve(outDir, 'index.ts'));
      await writeFile(
        resolve(outDir, 'index.ts'),
        quoteImports + '\n\n' + defaultExport,
      );
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
