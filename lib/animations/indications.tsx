import { Rect, RectProps } from '@motion-canvas/2d';
import {
    all,
    chain,
    Color,
    ColorSignal,
    createRef,
    createSignal,
    PossibleColor,
    Reference,
    SignalValue,
    SimpleSignal,
    Vector2,
    Vector2Signal,
    waitFor,
} from '@motion-canvas/core';
import * as colors from '../constants/colors';
import { getLocalPos } from '../util';

export function* flashAround(
    ref: Reference<any>,
    duration?: number,
    delay?: number,
    opts?: {
        modPos?: Vector2Signal;
        modWidth?: SimpleSignal<number>;
        modHeight?: SimpleSignal<number>;
        modLineWidth?: SimpleSignal<number>;
        color?: PossibleColor;
    },
    props?: RectProps,
) {
    const rect = createRef<Rect>();

    let o: { [key: string]: any } = {
        modPos: null,
        modWidth: null,
        modHeight: null,
        modLineWidth: null,
        color: null,
    };

    if (opts) {
        o = opts;
    }

    let { modPos, modWidth, modHeight, modLineWidth, color } = o;

    if (!modPos) {
        modPos = createSignal({ x: 0, y: 0 }) as Vector2Signal;
    }

    if (!modWidth) {
        modWidth = createSignal(0);
    }

    if (!modHeight) {
        modHeight = createSignal(0);
    }

    if (!modLineWidth) {
        modLineWidth = createSignal(0);
    }

    ref()
        .view()
        .add(
            <Rect
                position={createSignal(() =>
                    getLocalPos(ref().absolutePosition(), modPos()),
                )}
                width={createSignal(() => ref().width() + modWidth())}
                height={createSignal(() => ref().height() + modHeight())}
                lineWidth={createSignal(() => 2 + modLineWidth())}
                stroke={color ?? colors.amber500}
                end={0}
                {...props}
                ref={rect}
                scale={ref().scale}
            />,
        );

    const de = delay ?? 0.2;
    const du = duration ?? 1;
    yield* all(
        rect().end(1, du - de),
        chain(waitFor(de), rect().start(1, du - de)),
    );
}
