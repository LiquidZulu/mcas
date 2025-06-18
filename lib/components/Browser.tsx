import {
    Circle,
    colorSignal,
    Img,
    initial,
    Ray,
    RayProps,
    Rect,
    RectProps,
    Shape,
    signal,
    Vector2LengthSignal,
    vector2Signal,
} from '@motion-canvas/2d';
import {
    all,
    Color,
    ColorSignal,
    createRefArray,
    createSignal,
    PossibleVector2,
    Reference,
    ReferenceArray,
    SignalValue,
    SimpleSignal,
    SpacingSignal,
    ThreadGenerator,
    Vector2,
    Vector2Signal,
} from '@motion-canvas/core';
import { colors } from '../constants';
import { McasTxt as Txt } from './McasTxt';

export type BrowserHighlight =
    | [PossibleVector2, number]
    | [PossibleVector2, PossibleVector2];

export interface BrowserProps extends RectProps {
    scroll?: SignalValue<number>;
    scrollOffset?: SignalValue<number>;
    hyperlink?: SignalValue<string>;
    truncateHyperlink?: SignalValue<boolean>;
    highlight?: SignalValue<number>;
}

export class Browser extends Rect {
    @initial(new Color('#000000aa'))
    @colorSignal()
    public declare readonly shadowColor: ColorSignal<this>;

    @initial(50)
    @signal()
    public declare readonly shadowBlur: SimpleSignal<number, this>;

    @initial(new Vector2([0, 25]))
    @vector2Signal({ x: 'shadowOffsetX', y: 'shadowOffsetY' })
    public declare readonly shadowOffset: Vector2Signal<this>;

    @initial(20)
    @signal()
    public declare readonly radius: SpacingSignal<this>;

    @initial({ x: 1000, y: 800 })
    @vector2Signal({ x: 'width', y: 'height' })
    public declare readonly size: Vector2LengthSignal<this>;

    @initial(colors.zinc900)
    @colorSignal()
    public declare readonly fill: ColorSignal<this>;

    @initial(0)
    @signal()
    public readonly scroll: SimpleSignal<number, this>;

    @initial(60)
    @signal()
    public readonly scrollOffset: SimpleSignal<number, this>;

    @initial('')
    @signal()
    public readonly hyperlink: SimpleSignal<string, this>;

    @initial(true)
    @signal()
    public readonly truncateHyperlink: SimpleSignal<boolean, this>;

    @initial(0)
    @signal()
    public readonly highlight: SimpleSignal<number, this>;
    public highlightRays: ReferenceArray<Ray>[] = [];
    private highlights = 0;

    private contentHeight: number;

    constructor(props?: BrowserProps) {
        super({
            clip: true,
            layout: true,
            alignItems: 'center',
            direction: 'column',
            ...props,
        });

        this.add(
            <Rect
                alignItems="center"
                justifyContent="center"
                width="100%"
                height={80}
            >
                <Rect
                    layout={false}
                    position={() =>
                        [-this.width() / 2 + 80, 0] as [number, number]
                    }
                >
                    <Rect layout gap={12}>
                        {[colors.red500, colors.yellow500, colors.green500].map(
                            color => (
                                <Circle width={20} height={20} fill={color} />
                            ),
                        )}
                    </Rect>
                </Rect>
                <Rect
                    shadowBlur={5}
                    shadowColor="black"
                    radius={5}
                    lineWidth={1}
                    stroke="black"
                    fill={colors.zinc800}
                    height={40}
                    width={400}
                    alignItems="center"
                    justifyContent="center"
                    paddingLeft={10}
                    paddingRight={10}
                >
                    <Txt
                        fill="white"
                        fontSize={18}
                        text={() =>
                            this.truncateHyperlink()
                                ? this.hyperlink().replace(/(.{42})..+/, '$1…')
                                : this.hyperlink()
                        }
                    />
                </Rect>
            </Rect>,
        );

        this.contentHeight = (props.children as any as Shape).height();

        this.add(
            <Rect clip height="100%" fill="white" width="100%">
                <Rect
                    layout={false}
                    width="100%"
                    position={createSignal(
                        () =>
                            new Vector2(
                                0,
                                this.contentHeight / 4 -
                                    (this.contentHeight * this.scroll() -
                                        this.height() * this.scroll()) -
                                    this.height() / 2 +
                                    this.scrollOffset(),
                            ),
                    )}
                >
                    {props.children}
                </Rect>
                <Rect
                    layout={false}
                    height={80}
                    radius={10}
                    width={10}
                    fill={colors.zinc700}
                    position={() => [
                        500 - 10,
                        -(800 - 80) / 2 + 50 + this.scroll() * 610,
                    ]}
                />
            </Rect>,
        );
    }

    // browser().mkHighlight(width, [start: Vector2, length], [start: Vector2, length], ...)
    // browser().mkHighlight(rayProps, [start: Vector2, length], [start: Vector2, length], ...)
    // browser().mkHighlight(rayProps, [from, to], [from, to], ...)

    public mkHighlight(width: number, ...highlights: BrowserHighlight[]): this;
    public mkHighlight(
        rayProps: RayProps,
        ...highlights: BrowserHighlight[]
    ): this;
    public mkHighlight(
        widthOrRayProps: number | RayProps,
        ...highlights: BrowserHighlight[]
    ): this {
        this.highlightRays.push(createRefArray<Ray>());

        const props =
            typeof widthOrRayProps === 'number'
                ? { lineWidth: widthOrRayProps }
                : widthOrRayProps;

        for (let highlight of highlights) {
            this.addHighlight(props, highlight);
        }

        const rays = this.highlightRays[this.highlightRays.length - 1];

        for (let i = 0; i < rays.length; ++i) {
            const a = this.highlights;
            rays[i].end(
                createSignal(() => (this.highlight() - a) * rays.length - i),
            );
        }
        this.highlights++;
        return this;
    }

    private addHighlight(props: RayProps, [a, b]: BrowserHighlight) {
        const f = new Vector2(a);
        const t =
            typeof b === 'number' ? new Vector2(f.x + b, f.y) : new Vector2(b);

        this.children()[1]
            .children()[0]
            .add(
                <Ray
                    ref={this.highlightRays[this.highlights]}
                    position={new Vector2(0, -this.contentHeight / 4 - 25)}
                    layout={false}
                    from={f}
                    to={t}
                    lineWidth={18}
                    stroke={colors.yellow500}
                    opacity={0.5}
                    {...props}
                />,
            );
    }

    public removeHighlights() {
        for (let arr of this.highlightRays) {
            for (let h of arr) {
                h.remove();
            }
        }

        this.highlightRays = [];
        this.highlights = 0;
    }

    public *animateHighlights(
        animator: (
            ray?: Ray,
            highlightsIndex?: number,
            rayIndex?: number,
        ) => ThreadGenerator,
    ) {
        let toYield = [];

        for (let i = 0; i < this.highlightRays.length; ++i) {
            const highlight = this.highlightRays[i];
            for (let j = 0; j < highlight.length; ++j) {
                toYield.push(animator(highlight[j], i, j));
            }
        }

        yield* all(...toYield);
    }
}
