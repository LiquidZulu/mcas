import { makeProject } from '@motion-canvas/core';

import test from './scenes/test?scene';

export default makeProject({
    experimentalFeatures: true,
    scenes: [test],
});
