import { View2D } from '@motion-canvas/2d';
import { PossibleVector2, Vector2 } from '@motion-canvas/core';

export const a = (size: number) => new Array(size).fill(size);

export const windows = <T>(arr: Array<T>, size: number): T[][] =>
    arr.reduce((acc, _, i, a) => {
        if (i + size > a.length) {
            return acc;
        }

        return acc.concat([a.slice(i, i + size)]);
    }, []);

export const distance = (v1: Vector2, v2: Vector2) =>
    Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);

export const magnitude = (v: Vector2) => Math.sqrt(v.x ** 2 + v.y ** 2);

export const dot = (u: Vector2, v: Vector2) => u.x * v.x + u.y * v.y;

export const vectorSum = (...vecs: PossibleVector2[]) =>
    vecs.map(x => new Vector2(x)).reduce(
        (a: Vector2, e: Vector2) => new Vector2(a.x + e.x, a.y + e.y),
        new Vector2([0, 0]),
    );

export function vectorMean(...vecs: Vector2[]): Vector2 {
    if (vecs.length === 0) return new Vector2(0, 0);

    const sum = vectorSum(...vecs);
    return new Vector2(sum.x / vecs.length, sum.y / vecs.length);
}

export function vectorWeightedMean(...vecs: [Vector2, number][]): Vector2 {
    if (vecs.length === 0) return new Vector2(0, 0);

    const sum = vectorSum(
        ...vecs.map(
            ([pos, weight]) => new Vector2(pos.x * weight, pos.y * weight),
        ),
    );
    const totalWeight = vecs.reduce((sum, [, weight]) => sum + weight, 0);

    if (totalWeight === 0) {
        return new Vector2(0, 0);
    }

    return new Vector2(sum.x / totalWeight, sum.y / totalWeight);
}

export const getLocalPos = (pos: PossibleVector2, mod?: PossibleVector2, view?: View2D) => {
    const { x, y } = new Vector2(pos);


    let [ width, height ] = [ 1920, 1080 ];
    if( view ){
        width = view.size().x;
        height = view.size().y;
    }

    return vectorSum(
        new Vector2(
            x - width / 2,
            y - height / 2,
        ),
        mod
    )
    ;
};
