import { makeScene2D } from '@motion-canvas/2d';
import { createRef } from '@motion-canvas/core';
import { colors, Avatar } from '@lib/index';
import Aristotle from '../../assets/aristotle.png';

export default makeScene2D(function* (view) {
    view.fill(colors.bg);

    const a = createRef<Avatar>();

    view.add(<Avatar ref={a} rounded size={200} src={Aristotle} />);

    yield* a().size(500, 1);
});
