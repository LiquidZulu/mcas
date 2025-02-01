import {
    Circle,
    colorSignal,
    Img,
    initial,
    Rect,
    RectProps,
    Shape,
    signal,
    Vector2LengthSignal,
    vector2Signal,
} from '@motion-canvas/2d';
import {
    Color,
    ColorSignal,
    createSignal,
    SignalValue,
    SimpleSignal,
    SpacingSignal,
    Vector2,
    Vector2Signal,
} from '@motion-canvas/core';
import { colors } from '../constants';
import { McasTxt as Txt } from './McasTxt';

export interface BrowserProps extends RectProps {
    scroll?: SignalValue<number>;
    scrollOffset?: SignalValue<number>;
    hyperlink?: SignalValue<string>;
    truncateHyperlink?: SignalValue<boolean>;
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
    public declare readonly scroll: SimpleSignal<number, this>;

    @initial(60)
    @signal()
    public declare readonly scrollOffset: SimpleSignal<number, this>;

    @initial('')
    @signal()
    public declare readonly hyperlink: SimpleSignal<string, this>;

    @initial(true)
    @signal()
    public declare readonly truncateHyperlink: SimpleSignal<boolean, this>;

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
        this.add(
            <Rect clip height="100%" fill="white" width="100%">
                <Rect
                    layout={false}
                    width="100%"
                    position={createSignal(() => {
                        const contentHeight = (
                            this.children()[1]
                                .children()[0]
                                .children()[0] as any as Shape
                        ).height();
                        console.log(contentHeight, this.scroll());
                        return [
                            0,
                            contentHeight / 4 -
                                (contentHeight * this.scroll() -
                                    this.height() * this.scroll()) -
                                this.height() / 2 +
                                this.scrollOffset(),
                        ];
                    })}
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
}
