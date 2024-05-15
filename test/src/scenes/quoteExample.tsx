import aristotle from '../../../lib/assets/quote-assets/cards/aristotle.png';
import quotes from '../../../lib/assets/quote-assets/text';
import { makeQuoteScene } from '../../../lib/scenes/quote';
import { i } from '../../../lib/util';

export const quote0 = makeQuoteScene(
    aristotle,
    quotes[0],
    ['Aristotle, "Foo Bar Baz," in id., ', i('Lorem Ipsum'), ', pp. 69-420'],
    'quote-0',
);

export const quote1 = makeQuoteScene(
    aristotle,
    quotes[1],
    ['Aristotle, "Foo Bar Baz," in id., ', i('Lorem Ipsum'), ', pp. 69-420'],
    'quote-1',
);
