import { Gradient } from '@motion-canvas/2d';
import {
    Color,
    PossibleColor,
    PossibleVector2,
    Vector2,
} from '@motion-canvas/core';

type GradientDirection =
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'n'
    | 'north'
    | 'nw'
    | 'northwest'
    | 'w'
    | 'west'
    | 'sw'
    | 'southwest'
    | 's'
    | 'south'
    | 'se'
    | 'southeast'
    | 'e'
    | 'east'
    | 'ne'
    | 'northeast'
    | number;

// mkGradient([0,0], [500,100], rose500, ...)
export function mkGradient(
    from: PossibleVector2,
    to: PossibleVector2,
    ...colors: [PossibleColor, ...PossibleColor[]]
): Gradient;

// mkGradient(500, "top-left", rose500, emerald300, sky700, ...)
export function mkGradient(
    gradientWidth: number,
    direction: GradientDirection,
    ...colors: [PossibleColor, ...PossibleColor[]]
): Gradient;

// assume full diagonal width
// mkGradient('top-left', rose500, ...)
export function mkGradient(
    direction: GradientDirection,
    ...colors: [PossibleColor, ...PossibleColor[]]
): Gradient;

export function mkGradient(
    directionOrWidthOrFrom: GradientDirection | number | PossibleVector2,
    colorOrDirectionOrTo: PossibleColor | GradientDirection | PossibleVector2,
    ...colors: [PossibleColor, ...PossibleColor[]]
): Gradient {
    // definitely a GradientDirection
    if (typeof directionOrWidthOrFrom === 'string') {
        return mkGradientExplicit(
            ...getGradientPoints(
                directionOrWidthOrFrom as unknown as GradientDirection,
                2203,
            ),
            ...[colorOrDirectionOrTo as unknown as PossibleColor, ...colors],
        );
    }

    // either direction or width or number color
    // every direction or width is also a valid color
    // assume that no number colors will ever be used
    if (typeof directionOrWidthOrFrom === 'number') {
        // it is either a number direction or a width,
        // assume its a width if it is greater than 1
        if (directionOrWidthOrFrom > 1) {
            return mkGradientExplicit(
                ...getGradientPoints(
                    colorOrDirectionOrTo as unknown as GradientDirection,
                    directionOrWidthOrFrom as unknown as number,
                ),
                ...colors,
            );
        }

        // its a number direction
        return mkGradientExplicit(
            ...getGradientPoints(
                directionOrWidthOrFrom as unknown as GradientDirection,
                2203,
            ),
            ...[colorOrDirectionOrTo as unknown as PossibleColor, ...colors],
        );
    }

    // it is not mkGradient(direction, ...colors)
    // or mkGradient(width, direction, ...colors)

    return mkGradientExplicit(
        directionOrWidthOrFrom,
        colorOrDirectionOrTo as unknown as PossibleVector2,
        ...colors,
    );
}

function mkGradientExplicit(
    from: PossibleVector2,
    to: PossibleVector2,
    ...colors: [PossibleColor, ...PossibleColor[]]
): Gradient {
    let stops = [];

    if (colors.length > 2) {
        for (let i = 0; i < colors.length; ++i) {
            const prog = i / (colors.length - 1);
            stops.push({
                offset: prog,
                color: colors[i],
            });
        }
    }

    // make the interpolation nicer for the 2-colour case
    else if (colors.length == 2) {
        const N = 10;
        for (let i = 0; i < N + 1; ++i) {
            const prog = i / N;
            stops.push({
                offset: prog,
                color: new Color(colors[0]).lerp(new Color(colors[1]), prog),
            });
        }
    } else {
        stops.push({
            offset: 0,
            color: new Color(colors[0]),
        });
    }

    return new Gradient({
        from,
        to,
        stops,
    });
}

function getGradientPoints(
    direction: GradientDirection,
    width: number,
): [Vector2, Vector2] {
    // for whatever reason, it ends up with 0 as to the left, so I need to correct it by a quarter turn
    const nd = getNormalisedDirection(direction) + 0.25;
    const r = width / 2;
    return [
        new Vector2([
            r * Math.cos(nd * (2 * Math.PI)),
            r * Math.sin(nd * (2 * Math.PI)),
        ]),
        new Vector2([
            r * Math.cos((nd + 0.5) * (2 * Math.PI)),
            r * Math.sin((nd + 0.5) * (2 * Math.PI)),
        ]),
    ];
}

// 0 is up
function getNormalisedDirection(direction: GradientDirection): number {
    if (typeof direction === 'string') {
        switch (direction) {
            case 'up':
            case 'n':
            case 'north':
                return 0;
            case 'top-right':
            case 'nw':
            case 'northwest':
                return 1 / 8;
            case 'right':
            case 'w':
            case 'west':
                return 2 / 8;
            case 'bottom-right':
            case 'sw':
            case 'southwest':
                return 3 / 8;
            case 'down':
            case 's':
            case 'south':
                return 4 / 8;
            case 'bottom-left':
            case 'se':
            case 'southeast':
                return 5 / 8;
            case 'left':
            case 'e':
            case 'east':
                return 6 / 8;
            case 'top-left':
            case 'ne':
            case 'northeast':
                return 7 / 8;
        }
    }

    return direction % 1;
}
