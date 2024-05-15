import { makeProject } from '@motion-canvas/core';

import { quote0, quote1 } from './scenes/quoteExample';

export default makeProject({
    experimentalFeatures: true,
    scenes: [quote0, quote1],
});
