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
    ReferenceArray,
    SignalValue,
    SimpleSignal,
    ThreadGenerator,
    Vector2,
    all,
    chain,
    createRefArray,
    delay,
    sequence,
    waitFor,
    waitUntil,
} from '@motion-canvas/core';

import * as colors from '../constants/colors';
import { McasTxt as Txt, McasTxtProps } from './McasTxt';

export interface ArrowListProps extends RectProps {
    vgap?: SignalValue<number>;
    hgap?: SignalValue<number>;
    color?: SignalValue<PossibleColor>;
    rayColor?: SignalValue<PossibleColor>;
}

export class ArrowList extends Rect {
    @initial(64)
    @signal()
    public declare readonly vgap: SimpleSignal<number, this>;

    @initial(32)
    @signal()
    public declare readonly hgap: SimpleSignal<number, this>;

    @initial(colors.zinc50)
    @colorSignal()
    public declare readonly color: ColorSignal<this>;

    @initial(colors.zinc50)
    @colorSignal()
    public declare readonly rayColor: ColorSignal<this>;

    public declare readonly length: number;
    public declare readonly items: ReferenceArray<Txt>;
    private declare readonly rays: ReferenceArray<Ray>;
    private declare readonly isShowing: Map<Txt, boolean>;
    private declare readonly getRay: Map<Txt, Ray>;

    @vector2Signal({ x: 'width', y: 'height' })
    public declare readonly size: Vector2LengthSignal<this>;

    public constructor(props?: ArrowListProps) {
        super(props);

        this.items = createRefArray<Txt>();
        this.rays = createRefArray<Ray>();
        this.length = this.children().length;

        this.add(
            <Rect
                layout
                direction="column"
                gap={this.vgap}
                {...('size' in props ? { size: this.size } : {})}
            >
                {...this.children().map((x: Txt) => (
                    <Rect alignItems="center" gap={this.hgap}>
                        <Ray
                            end={0}
                            ref={this.rays}
                            toX={50}
                            lineWidth={6}
                            stroke={this.rayColor}
                            endArrow
                            arrowSize={12}
                        />
                        <Txt
                            opacity={0}
                            ref={this.items}
                            fill={this.color}
                            textWrap={
                                'textWrap' in x ? (x as any).textWrap() : false
                            }
                            maxWidth={x.maxWidth}
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
        yield* all(
            this.getRay.get(item).end(1, duration ?? 1),
            chain(waitFor(delay ?? 0.2), item.opacity(1, duration ?? 1)),
        );
    }

    public *hide(item: Txt, duration?: number, delay?: number) {
        this.isShowing.set(item, false);
        yield* all(
            this.getRay.get(item).start(1, duration ?? 1),
            chain(waitFor(delay ?? 0.2), item.opacity(0, duration ?? 1)),
        );
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
