import { Camera, View2D } from '@motion-canvas/2d';
import { createSignal, Reference, SignalValue, SimpleSignal } from '@motion-canvas/core';

// Fixes the camera cache bug which clips off content with opacity < 1 or shadowBlur > 0
// See: https://github.com/motion-canvas/motion-canvas/issues/1057
//
// This function should be run on the Camera component after it has
// been added to the scene:
// view.add(<Camera ref={camera}>...</Camera>);
// fixCamera(view, camera);
//
// This function will not be required in the future whenever the
// rendering logic for motion-canvas has been updated to fix
// this bug.
export function fixCamera(view: View2D, camera: Reference<Camera>){
    camera()
    .scene()
    .position(
      // I just regard this as a set of magic words.
      //
      // I did not properly work out the correct vector
      // operations to achieve what I wanted, I just
      // brute-forced it with an LLM.
      //
      // It is entirely possible that these magic words
      // do not work for some edge-case. They probably
      // break under rotation, for instance.
      //
      // The general idea is to keep the camera().scene()
      // bounds to properly match the bounds of the
      // actual canvas.
      createSignal(() => view
          .size()
          .div(2)
          .add(camera().position().mul(-1).mul(camera().zoom()))),
    );

  camera().scene().scale(camera().zoom);

  camera().cache(false);
}

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

export function mkSignal<T>(x: SignalValue<T>): SimpleSignal<T> {
    if (
        typeof x === 'function' &&
        'context' in x &&
        'isInitial' in x &&
        'reset' in x &&
        'save' in x
    ) {
        return x as SimpleSignal<T>;
    }

    return createSignal(x);
}

export function romanNumerals(num: number): string {
    // Return empty string for invalid inputs
    if (!Number.isInteger(num) || num <= 0 || num > 3999) {
        return "";
    }

    // Roman numeral mappings
    const romanValues: [number, string][] = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"]
    ];

    let result = "";

    // Iterate through roman values
    for (const [value, symbol] of romanValues) {
        // While the number is greater than or equal to current value
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }

    return result;
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
