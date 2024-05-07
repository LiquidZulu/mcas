import { TVec2 } from '../';

export const vectorSum = (vecs: TVec2[]) =>
  vecs.reduce(
    (a: [number, number], e: [number, number]) => [a[0] + e[0], a[1] + e[1]],
    [0, 0]
  );
