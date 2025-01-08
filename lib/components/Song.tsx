import {
    Node,
    NodeProps,
    Rect,
    Img,
    ImgProps,
    initial,
    signal,
    RectProps,
    Ray,
    Txt,
    FlexDirection,
    FlexItems,
} from '@motion-canvas/2d';
import {
    Reference,
    ReferenceArray,
    SignalValue,
    SimpleSignal,
    Vector2,
    all,
    createRef,
    createRefArray,
    createSignal,
    delay,
    waitFor,
} from '@motion-canvas/core';
import note from '../assets/note.svg';
import { zinc500 } from '../constants/colors';
import { fadein, fadeout } from '../animations';

export type SongPlace =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

export interface SongProps extends RectProps {
    title?: SignalValue<string>;
    author?: SignalValue<string>;
    place?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    flip?: SignalValue<boolean>;
    flipAuthor?: SignalValue<boolean>;
    hidden?: SignalValue<boolean>;
}

export class Song extends Rect {
    @initial('')
    @signal()
    public declare readonly title: SimpleSignal<string, this>;

    @initial('')
    @signal()
    public declare readonly author: SimpleSignal<string, this>;

    @initial('top-left')
    @signal()
    public declare readonly place: SimpleSignal<SongPlace, this>;

    @initial(false)
    @signal()
    public declare readonly flip: SimpleSignal<boolean, this>;

    @initial(false)
    @signal()
    public declare readonly flipAuthor: SimpleSignal<boolean, this>;

    @initial(false)
    @signal()
    public declare readonly hidden: SimpleSignal<boolean, this>;

    private declare readonly note: Reference<Img>;
    private declare readonly ray: Reference<Ray>;
    private declare readonly txts: ReferenceArray<Txt>;

    public constructor(props?: SongProps) {
        super(props);

        this.note = createRef<Img>();
        this.ray = createRef<Ray>();
        this.txts = createRefArray<Txt>();

        const rect = createRef<Rect>();

        this.add(
            <Rect
                ref={rect}
                layout
                gap={18}
                alignItems="center"
                direction={
                    createSignal(() =>
                        this.flip() ? 'row-reverse' : 'row',
                    ) as SignalValue<FlexDirection>
                }
            >
                <Img
                    ref={this.note}
                    opacity={() => (this.hidden() ? 0 : 1)}
                    src={note}
                    height={30}
                    shadowBlur={5}
                    shadowColor="000000aa"
                    shadowOffsetY={3}
                    shadowOffsetX={2}
                />
                <Ray
                    ref={this.ray}
                    start={() => (this.hidden() ? 0.5 : 0)}
                    end={() => (this.hidden() ? 0.5 : 1)}
                    lineWidth={2}
                    stroke="white"
                    toY={40}
                />
                <Rect
                    direction={
                        createSignal(() =>
                            this.flipAuthor() ? 'column-reverse' : 'column',
                        ) as SignalValue<FlexDirection>
                    }
                    alignItems={
                        createSignal(() =>
                            this.flip() ? 'end' : 'start',
                        ) as SignalValue<FlexItems>
                    }
                >
                    <Txt
                        ref={this.txts}
                        opacity={() => (this.hidden() ? 0 : 1)}
                        text={this.title}
                        fill="white"
                        fontSize={22}
                    />
                    <Txt
                        ref={this.txts}
                        opacity={() => (this.hidden() ? 0 : 1)}
                        text={this.author}
                        fill={zinc500}
                        fontSize={16}
                    />
                </Rect>
            </Rect>,
        );

        rect().position(
            !!props.position
                ? createSignal(() => this.position())
                : createSignal(() => {
                      switch (this.place()) {
                          case 'top-left':
                              return new Vector2([
                                  -1920 / 2 + rect().width() / 2 + 30,
                                  -1080 / 2 + rect().height() / 2 + 30,
                              ]);
                          case 'top-right':
                              return new Vector2([
                                  1920 / 2 - rect().width() / 2 - 30,
                                  -1080 / 2 + rect().height() / 2 + 30,
                              ]);
                          case 'bottom-right':
                              return new Vector2([
                                  1920 / 2 - rect().width() / 2 - 30,
                                  1080 / 2 - rect().height() / 2 - 30,
                              ]);
                          case 'bottom-left':
                              return new Vector2([
                                  -1920 / 2 + rect().width() / 2 + 30,
                                  1080 / 2 - rect().height() / 2 - 30,
                              ]);
                      }
                  }),
        );
    }

    public *show() {
        this.note().opacity(0);

        for (let txt of this.txts) {
            txt.opacity(0);
        }

        yield* all(
            fadein(this.note),
            this.ray().start(0.5).start(0, 1),
            this.ray().end(0.5).end(1, 1),
            ...this.txts.map((txt, i) =>
                delay(0.1 * (i + 1), txt.opacity(1, 1)),
            ),
        );
    }

    public *hide() {
        yield* all(
            fadeout(this.note),
            this.ray().start(0.5, 1),
            this.ray().end(0.5, 1),
            ...this.txts.map((txt, i) =>
                delay(0.1 * (i + 1), txt.opacity(0, 1)),
            ),
        );
    }

    public *annotate() {
        yield* this.show();
        yield* waitFor(5);
        yield* this.hide();
    }
}
