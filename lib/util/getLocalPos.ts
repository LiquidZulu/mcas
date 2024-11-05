import { Vector2 } from '@motion-canvas/core';

export const getLocalPos = (pos: Vector2, mod?: Vector2) => {
    const { x, y } = pos;

    let m = [0, 0];
    if (!!mod) {
        m = [mod.x, mod.y];
    }

    return {
        x: x - 1920 / 2 + m[0],
        y: y - 1080 / 2 + m[1],
    };
};
