// @ts-nocheck
import { makeScene2D, Rect, Ray, Img } from '@motion-canvas/2d';
import {
    all,
    chain,
    waitFor,
    createRef,
    createRefArray,
    createSignal,
} from '@motion-canvas/core';
import { colors, McasTxt as Txt, popin, popout } from 'mcas';

export default makeScene2D(function* (view) {
    view.fill(colors.bg);
});
