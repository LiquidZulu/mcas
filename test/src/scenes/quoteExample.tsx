import aristotle from '../../../lib/assets/quote-assets/cards/aristotle.png';
import lipsum from '../../../lib/assets/quote-assets/text/lorem-ipsum.png';
import { makeQuoteScene } from '../../../lib/scenes/quote';
import { i } from '../../../lib/util';

export const aristotleQuote = makeQuoteScene(
  aristotle,
  lipsum,
  ['Aristotle, "Foo Bar Baz," in id., ', i('Lorem Ipsum'), ', pp. 69-420'],
  'quote-aristotle',
);
