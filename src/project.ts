import { makeProject } from '@motion-canvas/core';

import example from './scenes/example?scene';
import { aristotleQuote } from './scenes/quoteExample';

export default makeProject({
  experimentalFeatures: true,
  scenes: [aristotleQuote],
});
