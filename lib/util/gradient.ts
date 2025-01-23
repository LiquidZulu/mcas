import { Gradient } from '@motion-canvas/2d';
import {
    Color,
    createSignal,
    PossibleColor,
    PossibleVector2,
    Reference,
    SimpleSignal,
    Vector2,
    Vector2Signal,
} from '@motion-canvas/core';
import { mkSignal } from './misc';

type GradientDirection =
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'l'
    | 'r'
    | 'u'
    | 'd'
    | 'tl'
    | 'tr'
    | 'bl'
    | 'br'
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
    return mkGradientExplicit(
        ...getGradientExplicit(
            directionOrWidthOrFrom,
            colorOrDirectionOrTo,
            ...colors,
        ),
    );
}

function getGradientExplicit(
    directionOrWidthOrFrom: GradientDirection | number | PossibleVector2,
    colorOrDirectionOrTo: PossibleColor | GradientDirection | PossibleVector2,
    ...colors: [PossibleColor, ...PossibleColor[]]
): [
    SimpleSignal<Vector2>,
    SimpleSignal<Vector2>,
    ...[PossibleColor, ...PossibleColor[]],
] {
    // definitely a GradientDirection
    if (typeof directionOrWidthOrFrom === 'string') {
        return [
            ...getGradientPoints(
                directionOrWidthOrFrom as unknown as GradientDirection,
                2203,
            ),
            ...[colorOrDirectionOrTo as unknown as PossibleColor, ...colors],
        ] as unknown as [
            SimpleSignal<Vector2>,
            SimpleSignal<Vector2>,
            ...[PossibleColor, ...PossibleColor[]],
        ];
    }

    // either direction or width or number color
    // every direction or width is also a valid color
    // assume that no number colors will ever be used
    if (typeof directionOrWidthOrFrom === 'number') {
        // it is either a number direction or a width,
        // assume its a width if it is greater than 1
        if (directionOrWidthOrFrom > 1) {
            return [
                ...getGradientPoints(
                    colorOrDirectionOrTo as unknown as GradientDirection,
                    directionOrWidthOrFrom as unknown as number,
                ),
                ...colors,
            ];
        }

        // its a number direction
        return [
            ...getGradientPoints(
                directionOrWidthOrFrom as unknown as GradientDirection,
                2203,
            ),
            ...[colorOrDirectionOrTo as unknown as PossibleColor, ...colors],
        ] as unknown as [
            SimpleSignal<Vector2>,
            SimpleSignal<Vector2>,
            ...[PossibleColor, ...PossibleColor[]],
        ];
    }

    // it is not mkGradient(direction, ...colors)
    // or mkGradient(width, direction, ...colors)

    return [
        mkSignal(directionOrWidthOrFrom) as SimpleSignal<Vector2>,
        mkSignal(colorOrDirectionOrTo) as unknown as SimpleSignal<Vector2>,
        ...colors,
    ];
}

function mkGradientExplicit(
    from: SimpleSignal<Vector2>,
    to: SimpleSignal<Vector2>,
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
): [SimpleSignal<Vector2>, SimpleSignal<Vector2>] {
    // for whatever reason, it ends up with 0 as to the left, so I need to correct it by a quarter turn
    const nd = getNormalisedDirection(direction) + 0.25;
    const r = width / 2;
    return [
        createSignal(
            new Vector2([
                r * Math.cos(nd * (2 * Math.PI)),
                r * Math.sin(nd * (2 * Math.PI)),
            ]),
        ),
        createSignal(
            new Vector2([
                r * Math.cos((nd + 0.5) * (2 * Math.PI)),
                r * Math.sin((nd + 0.5) * (2 * Math.PI)),
            ]),
        ),
    ];
}

// 0 is up
function getNormalisedDirection(direction: GradientDirection): number {
    if (typeof direction === 'string') {
        switch (direction) {
            case 'u':
            case 'up':
            case 'n':
            case 'north':
                return 0;
            case 'tr':
            case 'top-right':
            case 'nw':
            case 'northwest':
                return 1 / 8;
            case 'r':
            case 'right':
            case 'w':
            case 'west':
                return 2 / 8;
            case 'br':
            case 'bottom-right':
            case 'sw':
            case 'southwest':
                return 3 / 8;
            case 'd':
            case 'down':
            case 's':
            case 'south':
                return 4 / 8;
            case 'bl':
            case 'bottom-left':
            case 'se':
            case 'southeast':
                return 5 / 8;
            case 'l':
            case 'left':
            case 'e':
            case 'east':
                return 6 / 8;
            case 'tl':
            case 'top-left':
            case 'ne':
            case 'northeast':
                return 7 / 8;
        }
    }

    return direction % 1;
}

export function localGradient(ref: Reference<any>) {
    // mkGradient([0,0], [500,100], rose500, ...)
    function mkLocalGradient(
        from: PossibleVector2,
        to: PossibleVector2,
        ...colors: [PossibleColor, ...PossibleColor[]]
    ): Gradient;

    // mkGradient(500, "top-left", rose500, emerald300, sky700, ...)
    function mkLocalGradient(
        gradientWidth: number,
        direction: GradientDirection,
        ...colors: [PossibleColor, ...PossibleColor[]]
    ): Gradient;

    // assume full diagonal width
    // mkGradient('top-left', rose500, ...)
    function mkLocalGradient(
        direction: GradientDirection,
        ...colors: [PossibleColor, ...PossibleColor[]]
    ): Gradient;

    function mkLocalGradient(
        directionOrWidthOrFrom: GradientDirection | number | PossibleVector2,
        colorOrDirectionOrTo:
            | PossibleColor
            | GradientDirection
            | PossibleVector2,
        ...colors: [PossibleColor, ...PossibleColor[]]
    ) {
        const [from, to, ...cols] = getGradientExplicit(
            directionOrWidthOrFrom,
            colorOrDirectionOrTo,
            ...colors,
        );

        const f = createSignal(() => new Vector2(from()));
        const t = createSignal(() => new Vector2(to()));

        const squash = [
            createSignal(() => ref().width() / ref().view().width()),
            createSignal(() => ref().height() / ref().view().height()),
        ];

        return mkGradientExplicit(
            createSignal(
                () => new Vector2([f().x * squash[0](), f().y * squash[1]()]),
            ),
            createSignal(
                () => new Vector2([t().x * squash[0](), t().y * squash[1]()]),
            ),
            ...cols,
        );
    }

    return mkLocalGradient;
}
