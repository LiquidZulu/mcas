import { makeScene2D, Rect } from '@motion-canvas/2d';
import {
    Color,
    tween,
    createRef,
    easeInOutCubic,
    loop,
} from '@motion-canvas/core';
import { McasTxt as Txt, colors, SquigglyBorder } from '../';

export default makeScene2D(function* (view) {
    view.fill(colors.bg);

    const squig = createRef<SquigglyBorder>();

    view.add(
        <SquigglyBorder ref={squig}>
            <Rect width={500} height={500} fill="orange" />
        </SquigglyBorder>
    );

    for (let i = 0; i < 50; ++i) {
        yield* squig().wiggle();
    }
});
