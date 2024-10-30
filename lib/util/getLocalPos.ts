import { Vector2 } from '@motion-canvas/core';

export const getLocalPos = (pos: Vector2, mod?: Vector2) => {
    const { x, y } = pos;
    return {
        x: x - 1920 / 2 + mod?.x,
        y: y - 1080 / 2 + mod?.y,
    };
};
