import { createSignal, SignalValue } from '@motion-canvas/core';

export const commaSeparators = (
    num: number | string,
    separator?: string,
    divisionSize?: number,
) =>
    num
        .toString()
        .replace(
            new RegExp(
                String.raw`\B(?=(\d{${divisionSize ?? 3}})+(?!\d))`,
                'g',
            ),
            separator ?? ',',
        );

export const interleaver =
    <T>(inserter: (accumulator?: T[], current?: T, index?: number) => T) =>
    (accumulator: T[], current: T, index: number) => {
        if (index > 0) {
            accumulator.push(inserter(accumulator, current, index));
        }
        accumulator.push(current);
        return accumulator;
    };

export function mkSignal<T>(x: SignalValue<T>) {
    if (typeof x === 'function') {
        return x;
    }

    return createSignal(x);
}

export const unitsSI = {
    k: 1e3,
    M: 1e6,
    G: 1e9,
    T: 1e12,
    P: 1e15,
    E: 1e18,
};

export const unitsSocialMedia = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
};

export function SIround(n: number, units?: { [key: string]: number }): string {
    const u = Object.entries(units ?? unitsSI);

    for (let i = 0; i < u.length - 1; ++i) {
        const [unit, factor] = u[i];
        const nextFactor = u[i + 1][1];

        if (n < nextFactor) {
            return `${(n / factor).toFixed(0)}${unit}`;
        }
    }

    const [fUnit, fFactor] = u.pop();
    return `${(n / fFactor).toFixed(0)}${fUnit}`;
}
