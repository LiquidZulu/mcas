import {
    Node,
    NodeProps,
    initial,
    signal,
    Rect,
    Ray,
    colorSignal,
    RectProps,
    Vector2LengthSignal,
    vector2Signal,
} from '@motion-canvas/2d';
import {
    ColorSignal,
    PossibleColor,
    Reference,
    ReferenceArray,
    SignalValue,
    SimpleSignal,
    ThreadGenerator,
    Vector2,
    all,
    chain,
    createRefArray,
    createSignal,
    delay,
    sequence,
    waitFor,
    waitUntil,
} from '@motion-canvas/core';

import * as colors from '../constants/colors';
import { McasTxt as Txt, McasTxtProps } from './McasTxt';
import { mkSignal } from '../util';

export type ArrowListAnimation = (
    text: Txt,
    ray: Ray,
    duration?: number,
    delay?: number,
) => ThreadGenerator;

export interface ArrowListProps extends RectProps {
    vgap?: SignalValue<number>;
    hgap?: SignalValue<number>;
    color?: SignalValue<PossibleColor>;
    rayColor?: SignalValue<PossibleColor>;
    in?: ArrowListAnimation;
    out?: ArrowListAnimation;
}

const defaultIn: ArrowListAnimation = (
    text: Txt,
    ray: Ray,
    duration?: number,
    delay?: number,
) =>
    all(
        ray.end(1, duration ?? 1),
        chain(waitFor(delay ?? 0.2), text.opacity(1, duration ?? 1)),
    );

const defaultOut: ArrowListAnimation = (
    text: Txt,
    ray: Ray,
    duration?: number,
    delay?: number,
) =>
    all(
        ray.start(1, duration ?? 1),
        chain(waitFor(delay ?? 0.2), text.opacity(0, duration ?? 1)),
    );

export class ArrowList extends Rect {
    declare public readonly in: ArrowListAnimation;
    declare public readonly out: ArrowListAnimation;

    @initial(64)
    @signal()
    declare public readonly vgap: SimpleSignal<number, this>;

    @initial(64)
    @signal()
    declare public readonly hgap: SimpleSignal<number, this>;

    @initial(colors.zinc50)
    @colorSignal()
    declare public readonly color: ColorSignal<this>;

    @initial(colors.zinc50)
    @colorSignal()
    declare public readonly rayColor: ColorSignal<this>;

    declare public readonly length: number;
    declare public readonly items: ReferenceArray<Txt>;
    declare private readonly rays: ReferenceArray<Ray>;
    declare private readonly isShowing: Map<Txt, boolean>;
    declare private readonly getRay: Map<Txt, Ray>;

    @vector2Signal({ x: 'width', y: 'height' })
    declare public readonly size: Vector2LengthSignal<this>;

    public constructor(props?: ArrowListProps) {
        super(props);

        this.in = props.in ?? defaultIn;
        this.out = props.out ?? defaultOut;

        this.items = createRefArray<Txt>();
        this.rays = createRefArray<Ray>();
        this.length = this.children().length;

        this.add(
            <Rect
                width="100%"
                layout
                direction="column"
                gap={this.vgap}
                {...('size' in props ? { size: this.size } : {})}
            >
                {...this.children().map((x: Txt) => (
                    <Rect
                        alignItems="center"
                        gap={this.hgap}
                        justifyContent="start"
                    >
                        <Ray
                            end={0}
                            ref={this.rays}
                            lineWidth={16}
                            arrowSize={26}
                            endArrow
                            toX={80}
                            stroke={this.rayColor}
                        />
                        <Txt
                            ref={this.items}
                            fill={this.color}
                            textWrap={
                                'textWrap' in x ? (x as any).textWrap() : false
                            }
                            maxWidth="90%"
                        >
                            {x}
                        </Txt>
                    </Rect>
                ))}
            </Rect>,
        );

        this.isShowing = new Map(this.items.map(k => [k, false]));
        this.getRay = new Map(this.items.map((k, i) => [k, this.rays[i]]));
    }

    public *next(
        event?: string,
        duration?: number,
        additionalThreads?: ThreadGenerator,
    ) {
        for (let item of this.items) {
            if (!this.isShowing.get(item)) {
                if (!!event) {
                    yield* waitUntil(event);
                }
                yield* all(
                    this.show(item, duration),
                    additionalThreads ?? all(),
                );
                return;
            }
        }
    }

    public *show(item: Txt, duration?: number, delay?: number) {
        this.isShowing.set(item, true);
        yield* this.in(item, this.getRay.get(item), duration, delay);
    }

    public *hide(item: Txt, duration?: number, delay?: number) {
        this.isShowing.set(item, false);
        yield* this.out(item, this.getRay.get(item), duration, delay);
    }

    public *showAll(duration?: number, delayAmount?: number) {
        yield* all(
            ...this.items.map((item, i) =>
                delay((delayAmount ?? 0.1) * i, this.show(item, duration)),
            ),
        );
    }

    public *hideAll(
        event?: string,
        additionalThreads?: ThreadGenerator,
        duration?: number,
        delayAmount?: number,
    ) {
        if (!!event) {
            yield* waitUntil(event);
        }

        const hidem = this.items.map(item => this.hide(item, duration));

        yield* !!additionalThreads
            ? sequence(delayAmount ?? 0.1, additionalThreads, ...hidem)
            : sequence(delayAmount ?? 0.1, ...hidem);
    }
}
