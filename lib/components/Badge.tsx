import { McasTxt as Txt } from './McasTxt';
import {
    Node,
    NodeProps,
    Rect,
    RectProps,
    colorSignal,
    initial,
    signal,
} from '@motion-canvas/2d';
import {
    Color,
    ColorSignal,
    PossibleColor,
    PossibleSpacing,
    SignalValue,
    SimpleSignal,
    createRef,
    createSignal,
} from '@motion-canvas/core';

export interface BadgeProps extends NodeProps {
    bg?: SignalValue<PossibleColor>;
    fontColor?: SignalValue<PossibleColor>;
    padding?: RectProps['padding'];
    paddingLeft?: RectProps['paddingLeft'];
    paddingRight?: RectProps['paddingRight'];
    paddingTop?: RectProps['paddingTop'];
    paddingBottom?: RectProps['paddingBottom'];
    children: string | (string | Node)[];
}

export class Badge extends Node {
    @initial(new Color({ r: 256, g: 256, b: 256, a: 1 }))
    @colorSignal()
    public declare readonly bg: ColorSignal<this>;

    @initial(new Color({ r: 20, g: 20, b: 20, a: 1 }))
    @colorSignal()
    public declare readonly fontColor: ColorSignal<this>;

    @signal()
    public declare readonly padding: SimpleSignal<PossibleSpacing, this>;

    @signal()
    public declare readonly paddingLeft: SimpleSignal<number, this>;

    @signal()
    public declare readonly paddingRight: SimpleSignal<number, this>;

    @signal()
    public declare readonly paddingTop: SimpleSignal<number, this>;

    @signal()
    public declare readonly paddingBottom: SimpleSignal<number, this>;

    constructor(props?: BadgeProps) {
        super(props);

        const txt = createRef<Txt>();
        const rect = createRef<Rect>();

        this.add(
            <Rect
                ref={rect}
                fill={this.bg}
                padding={this.padding}
                paddingLeft={this.paddingLeft}
                paddingRight={this.paddingRight}
                paddingTop={this.paddingTop}
                paddingBottom={this.paddingBottom}
            >
                <Txt fill={this.fontColor} ref={txt}>
                    {props.children}
                </Txt>
            </Rect>,
        );

        rect().height(createSignal(() => txt().cacheBBox().height));
        rect().width(createSignal(() => txt().cacheBBox().width));
        rect().radius(createSignal(() => rect().height()));
    }
}
