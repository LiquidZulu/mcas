import { makeProject } from '@motion-canvas/core';

import { aristotleQuote } from './scenes/quoteExample';

export default makeProject({
  experimentalFeatures: true,
  scenes: [aristotleQuote],
});
