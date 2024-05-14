import {
  makeScene2D,
  Layout,
  Rect,
  Ray,
  Img,
  Txt,
  Gradient,
} from '@motion-canvas/2d';
import {
  Color,
  all,
  createRef,
  createRefArray,
  linear,
  waitFor,
} from '@motion-canvas/core';

import { colors } from '../';

export default makeScene2D(function* (view) {
  view.fill(colors.bg);
});
