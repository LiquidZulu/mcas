import { spring } from '@motion-canvas/core';

export const ShakeSpring = (intensity?: number) => ({
    mass: 0.1,
    stiffness: 100.0,
    damping: 0.9,
    initialVelocity: 10e2 * (intensity ?? 1),
});

export const shake = (cb: (val: number) => void, intensity?: number) =>
    spring(ShakeSpring(intensity), 0, 0, 0.01, cb);
