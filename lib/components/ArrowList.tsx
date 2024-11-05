import {
    Node,
    NodeProps,
    initial,
    signal,
    Rect,
    Ray,
    Txt,
    colorSignal,
} from '@motion-canvas/2d';
import {
    ColorSignal,
    PossibleColor,
    ReferenceArray,
    SignalValue,
    SimpleSignal,
    all,
    chain,
    createRefArray,
    waitFor,
} from '@motion-canvas/core';

import * as colors from '../constants/colors';

export interface ArrowListProps extends NodeProps {
    vgap?: SimpleSignal<number>;
    hgap?: SimpleSignal<number>;
    color?: SignalValue<PossibleColor>;
    rayColor?: SignalValue<PossibleColor>;
}

export class ArrowList extends Node {
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

    public constructor(props?: ArrowListProps) {
        super(props);

        this.items = createRefArray<Txt>();
        this.rays = createRefArray<Ray>();
        this.length = this.children().length;

        this.add(
            <Rect layout direction="column" gap={this.vgap}>
                {...this.children().map(x => (
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
                        <Txt opacity={0} ref={this.items} fill={this.color}>
                            {x}
                        </Txt>
                    </Rect>
                ))}
            </Rect>,
        );

        this.isShowing = new Map(this.items.map(k => [k, false]));
        this.getRay = new Map(this.items.map((k, i) => [k, this.rays[i]]));
    }

    public *next(duration?: number) {
        for (let item of this.items) {
            if (!this.isShowing.get(item)) {
                yield* this.show(item, duration);
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

    public *showAll(duration?: number, delay?: number) {
        yield* all(...this.items.map(item => this.show(item, duration, delay)));
    }

    public *hideAll(duration?: number, delay?: number) {
        yield* all(...this.items.map(item => this.hide(item, duration, delay)));
    }
}
