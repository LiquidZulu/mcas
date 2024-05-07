import { makeScene2D, Rect } from '@motion-canvas/2d';
import { createRef, waitFor } from '@motion-canvas/core';

import { popin, popout, colors } from '../';

export default makeScene2D(function* (view) {
    view.fill(colors.bg);

    const blah = createRef<Rect>();

    view.add(<Rect ref={blah} width={500} height={500} fill="orange" />);

    yield* popin(blah);
    yield* blah().scale(1.5, 5);
    yield* waitFor(1);
    yield* popout(blah);
});
