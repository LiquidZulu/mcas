import { Command } from 'commander';

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
  .action((filenames, options) => {
    console.log(filenames, options);
  });

cli.parseAsync(process.argv);
