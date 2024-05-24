import aristotle from '@internal/lib/assets/quote-assets/cards/aristotle.png';
import quotes from '@internal/lib/assets/quote-assets/text';
import { makeQuoteScene } from '@internal/lib/scenes/quote';
import { i } from '@internal/lib/util';

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
