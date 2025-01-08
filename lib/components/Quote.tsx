import {
    Gradient,
    Img,
    initial,
    Node,
    Ray,
    Rect,
    RectProps,
    signal,
} from '@motion-canvas/2d';
import {
    all,
    Color,
    createRef,
    createRefArray,
    createSignal,
    linear,
    loopFor,
    Reference,
    ReferenceArray,
    SimpleSignal,
    spawn,
    useDuration,
} from '@motion-canvas/core';
import { TRichText } from '../types';
import { SquigglyBorder } from './SquigglyBorder';
import mark from '../assets/quote-assets/quote-marks.png';
import { generateTxt } from '../util';
import { McasTxt as Txt } from '../components';

export interface QuoteProps extends RectProps {
    card: string;
    quoteText: { image: string; height: number; width: number };
    citationText: TRichText[];
}

export class Quote extends Rect {
    @initial('')
    @signal()
    public declare readonly card: SimpleSignal<string, this>;

    @initial({ image: '', height: 0, width: 0 })
    @signal()
    public declare readonly quoteText: SimpleSignal<
        { image: string; height: number; width: number },
        this
    >;

    @initial([])
    @signal()
    public declare readonly citationText: SimpleSignal<TRichText[], this>;

    public declare readonly squiggly: Reference<SquigglyBorder>;
    public declare readonly text: Reference<Img>;
    public declare readonly marks: ReferenceArray<Img>;
    public declare readonly rays: ReferenceArray<Ray>;
    public declare readonly citation: Reference<Txt>;

    private declare isShowing: boolean;

    public constructor(props?: QuoteProps) {
        super(props);

        this.isShowing = false;

        this.squiggly = createRef<SquigglyBorder>();
        this.text = createRef<Img>();
        this.marks = createRefArray<Img>();
        this.rays = createRefArray<Ray>();
        this.citation = createRef<Txt>();

        this.add(
            <Rect layout gap={128}>
                <Rect width={512} height={680}>
                    <SquigglyBorder ref={this.squiggly}>
                        <Rect
                            layout={false}
                            cache
                            width={512}
                            height={680}
                            fill="white"
                        >
                            <Img
                                src={this.card}
                                height={680}
                                shadowBlur={50}
                                shadowOffsetY={25}
                                shadowColor="#000000aa"
                            />
                        </Rect>
                    </SquigglyBorder>
                </Rect>
                <Rect direction="column" gap={32}>
                    <Rect alignItems="center" gap={16}>
                        <Img ref={this.marks} height={40} src={mark} />
                        <Ray
                            ref={this.rays}
                            lineWidth={8}
                            toX={800}
                            stroke="white"
                        />
                    </Rect>
                    <Rect
                        cache
                        width={876}
                        height={500}
                        fill={
                            new Gradient({
                                type: 'linear',
                                fromY: -250,
                                toY: 250,
                                stops: [
                                    {
                                        offset: 0.01,
                                        color: new Color({
                                            a: 0,
                                            r: 0,
                                            g: 0,
                                            b: 0,
                                        }),
                                    },
                                    {
                                        offset: 0.2,
                                        color: 'white',
                                    },
                                    {
                                        offset: 0.8,
                                        color: 'white',
                                    },
                                    {
                                        offset: 0.99,
                                        color: new Color({
                                            a: 0,
                                            r: 0,
                                            g: 0,
                                            b: 0,
                                        }),
                                    },
                                ],
                            })
                        }
                    >
                        <Img
                            compositeOperation="source-in"
                            ref={this.text}
                            src={() => this.quoteText().image}
                            width={876}
                            height={() =>
                                this.quoteText().height *
                                (876 / this.quoteText().width)
                            }
                        />
                    </Rect>
                    <Rect alignItems="center" gap={16}>
                        <Ray
                            ref={this.rays}
                            lineWidth={8}
                            toX={-800}
                            stroke="white"
                        />
                        <Img
                            ref={this.marks}
                            height={40}
                            src={mark}
                            rotation={180}
                        />
                    </Rect>
                    {generateTxt(this.citationText(), {
                        ref: this.citation,
                        fill: 'acacaf',
                        fontFamily: 'mononoki',
                        fontSize: 32,
                        textWrap: true,
                        maxWidth: 876,
                    })}
                </Rect>
            </Rect>,
        );

        this.squiggly().opacity(0);
        this.squiggly().scale(0.8);

        this.marks.forEach(m => {
            m.opacity(0);
            m.scale(0.8);
        });
        this.rays.forEach(r => {
            r.end(0);
        });

        this.citation().opacity(0);
        this.citation().margin([50, 0, 50, 0]);

        this.text().opacity(0.01);

        if (this.text().height() > 500) {
            this.text().margin([400, 0, 0, 0]);
        } else {
            this.text().margin([100, 0, 0, 0]);
        }
    }

    public *show(duration?: number) {
        this.isShowing = true;
        const show = () => this.isShowing;
        const theSquiggly = this.squiggly;
        yield spawn(function* () {
            while (show()) {
                yield* theSquiggly().wiggle();
            }
        });

        yield* all(
            this.squiggly().opacity(1, duration ?? 0.5),
            this.squiggly().scale(1, duration ?? 0.5),
            ...this.marks.map(m =>
                all(m.opacity(1, duration ?? 0.5), m.scale(1, duration ?? 0.5)),
            ),
            ...this.rays.map(r => r.end(1, duration ?? 0.5)),
            this.citation().opacity(1, duration ?? 0.5),
            this.citation().margin(0, duration ?? 0.5),
            this.text().opacity(1, duration ?? 0.5),
        );
    }

    public *scrollText(eventName: string) {
        const show = () => this.isShowing;
        const theSquiggly = this.squiggly;
        yield spawn(function* () {
            while (show()) {
                yield* theSquiggly().wiggle();
            }
        });
        yield* this.text().margin(
            [
                this.text().height() > 500 ? -this.text().height() + 100 : 0,
                0,
                0,
                0,
            ],
            useDuration(eventName),
            linear,
        );
    }

    public *hide(duration?: number) {
        yield* all(
            this.squiggly().opacity(0, duration ?? 0.5),
            this.squiggly().scale(0.8, duration ?? 0.5),
            ...this.marks.map(m =>
                all(
                    m.opacity(0, duration ?? 0.5),
                    m.scale(0.8, duration ?? 0.5),
                ),
            ),
            ...this.rays.map(r => r.start(1, duration ?? 0.5)),
            this.citation().opacity(0, duration ?? 0.5),
            this.citation().margin([50, 0, 50, 0], duration ?? 0.5),
            this.text().opacity(0, duration ?? 0.5),
        );

        this.isShowing = false;
    }
}
