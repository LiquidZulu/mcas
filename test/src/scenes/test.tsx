import { Txt, makeScene2D } from '@motion-canvas/2d';
import { colors, Badge } from '../../../lib';

export default makeScene2D(function* (view) {
    view.fill(colors.bg);

    view.add(
        <Badge fontColor="blue">
            <Txt.b>t</Txt.b>est
        </Badge>,
    );
});
