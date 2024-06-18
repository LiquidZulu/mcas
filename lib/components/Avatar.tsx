import {
    Node,
    NodeProps,
    Rect,
    Img,
    ImgProps,
    initial,
    signal,
} from '@motion-canvas/2d';
import {
    SignalValue,
    SimpleSignal,
    createRef,
    createSignal,
} from '@motion-canvas/core';

export interface AvatarProps extends NodeProps {
    rounded?: SignalValue<number | boolean>;
    src: ImgProps['src'];
    size: SignalValue<number>;
}

export class Avatar extends Node {
    @initial(true)
    @signal()
    public declare readonly rounded: SimpleSignal<number | boolean, this>;

    @initial(120)
    @signal()
    private declare readonly extension: SimpleSignal<number, this>;

    @signal()
    public declare readonly src: SimpleSignal<string, this>;

    @initial(250)
    @signal()
    public declare readonly size: SimpleSignal<number, this>;

    public constructor(props?: AvatarProps) {
        super(props);

        const imgRef = createRef<Img>();

        this.add(
            <Rect
                radius={createSignal(
                    () =>
                        Array(4).fill(
                            (() => {
                                if (typeof this.rounded() == 'boolean') {
                                    if (this.rounded())
                                        return this.size() as number;
                                    else return 0 as number;
                                } else return this.rounded() as number;
                            })(),
                        ) as [number, number, number, number],
                )}
                height={this.size}
                width={this.size}
                clip
            >
                <Img ref={imgRef} src={this.src} height={this.size} />
            </Rect>,
        );

        // handle vertical aspect ratios

        const { x, y } = imgRef().size();

        if (x < y) {
            imgRef().height(null);
            imgRef().width(this.size);
        }
    }
}
