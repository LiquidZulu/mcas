import { FullSceneDescription, ValueDispatcher } from '@motion-canvas/core';
import { Txt } from '@motion-canvas/2d';

import aristotle from '../assets/quote-assets/cards/aristotle.png';
import lipsum from '../assets/quote-assets/text/lorem-ipsum.png';
import { makeQuoteScene, b, i } from '../';

export const aristotleQuote = makeQuoteScene(
  aristotle,
  lipsum,
  ['Aristotle, "Foo Bar Baz," in id., ', i('Lorem Ipsum'), ', pp. 69-420'],
  'quote-aristotle'
);
