import { Vector2 } from '@motion-canvas/core';

export const a = (size: number) => new Array(size).fill(size);

export const distance = (v1: Vector2, v2: Vector2) =>
    Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);

export const magnitude = (v: Vector2) => Math.sqrt(v.x ** 2 + v.y ** 2);

export const dot = (u: Vector2, v: Vector2) => u.x * v.x + u.y * v.y;

export const vectorSum = (...vecs: Vector2[]) =>
    vecs.reduce(
        (a: Vector2, e: Vector2) => new Vector2(a.x + e.x, a.y + e.y),
        new Vector2([0, 0]),
    );
