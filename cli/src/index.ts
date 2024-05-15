import { Command } from 'commander';
import { version } from '../../package.json';

import { handleQuotes } from './arguments';

const cli = new Command();

cli
  .name('mcas')
  .description('Motion Canvas Asset Set')
  .version(version)
  .addHelpText(
    'after',
    `

Examples:
  mcas -q ./script.org  generate quotes from the provided orgmode file.
  mcas -s foobar        generate a scene called "foobar" in src/scenes.`,
  )
  .showHelpAfterError();

cli
  .argument('[rest...]', 'The data to perform the specified operation upon.')
  .option('-q, --quotes', 'Generate quotes from provided files.')
  .option(
    '-s, --scene',
    'Generate scene[s] with the provided names in src/scenes.',
  )
  .action(async (rest, options) => {
    if (options.quotes) {
      handleQuotes(rest);
    }
  });

cli.parseAsync(process.argv);
