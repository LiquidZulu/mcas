import {
  FullSceneDescription,
  ValueDispatcher,
  makeProject,
} from '@motion-canvas/core';
import { Txt } from '@motion-canvas/2d';

import makeQuote from './scenes/quote';
import aristotle from './assets/quote-assets/cards/aristotle.png';
import lipsum from './assets/quote-assets/text/lorem-ipsum.png';

import example from './scenes/example?scene';
import { aristotleQuote } from './scenes/quoteExample';

export default makeProject({
  experimentalFeatures: true,
  scenes: [aristotleQuote],
});
