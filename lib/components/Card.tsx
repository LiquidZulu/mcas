import {
    Node,
    NodeProps,
    Rect,
    Img,
    ImgProps,
    initial,
    signal,
    RectProps,
    Vector2LengthSignal,
    colorSignal,
    FlexItems,
    FlexContent,
    FlexDirection,
    compound,
} from '@motion-canvas/2d';
import {
    ColorSignal,
    PossibleColor,
    SignalValue,
    SimpleSignal,
    SpacingSignal,
    ThreadGenerator,
    Vector2,
    all,
    createRef,
    createSignal,
} from '@motion-canvas/core';
import { red500 } from '../constants/colors';
import { McasTxt } from './McasTxt';
import { fadein, fadeout } from '../animations';
import { zwsp } from '../constants/characters';

export interface CardProps extends RectProps {
    color?: SignalValue<PossibleColor>;
    title: SignalValue<string>;
    animation?: () => ThreadGenerator;
    reverse?: () => ThreadGenerator;
    hidden?: boolean;
}

export class Card extends Rect {
    public declare readonly animation: () => ThreadGenerator;
    public declare readonly reverse: () => ThreadGenerator;
    public declare readonly hidden: boolean;

    @initial(red500)
    @colorSignal()
    public declare readonly color: ColorSignal<this>;

    @initial('')
    @signal()
    public declare readonly title: SimpleSignal<string, this>;

    @initial(true)
    @signal()
    public declare readonly layout: SimpleSignal<boolean, this>;

    @initial(15)
    @signal()
    public declare readonly lineWidth: SimpleSignal<number, this>;

    @initial('center')
    @signal()
    public declare readonly alignItems: SimpleSignal<FlexItems, this>;

    @initial('space-evenly')
    @signal()
    public declare readonly justifyContent: SimpleSignal<FlexContent, this>;

    @initial('column-reverse')
    @signal()
    public declare readonly direction: SimpleSignal<FlexDirection, this>;

    private declare readonly desiredTitle: string;

    public constructor(props?: CardProps) {
        super(props);

        this.padding(props.padding ?? 60);
        this.gap(props.gap ?? 180);
        this.desiredTitle = this.title();

        if (props.hidden) {
            this.end(0);
            this.title(zwsp);
            for (let child of this.children()) {
                child.opacity(0);
            }
        }

        this.animation =
            props.animation ??
            (() =>
                all(
                    this.title(zwsp).title(props.title, 1),
                    this.end(0).end(1, 1),
                    ...this.children().map(child => fadein(() => child)),
                ));
        this.reverse =
            props.reverse ??
            (() =>
                all(
                    this.title(zwsp, 1),
                    this.end(0, 1),
                    ...this.children().map(child => fadeout(() => child)),
                ));

        this.stroke(this.color);
        this.add(
            <McasTxt
                text={this.title}
                fontSize={60}
                fontFamily="oswald"
                fill={this.color}
                glow
            />,
        );
    }

    public *show() {
        yield* all(
            this.title(zwsp).title(this.desiredTitle, 1),
            this.end(0).end(1, 1),
            this.animation(),
        );
    }

    public *hide() {
        yield* all(this.title(zwsp, 1), this.end(0, 1), this.reverse());
    }
}
