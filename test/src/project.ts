import { makeProject } from '@motion-canvas/core';

import { quoteScenes } from './scenes/quoteExample';

export default makeProject({
    experimentalFeatures: true,
    scenes: quoteScenes,
});
