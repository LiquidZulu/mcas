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
