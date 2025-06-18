import { Rect, RectProps, View2D } from '@motion-canvas/2d';
import {
    all,
    chain,
    createRef,
    PossibleColor,
    Reference,
    ThreadGenerator,
    useRandom,
    Vector2,
    waitUntil,
} from '@motion-canvas/core';
import { McasTxt, McasTxtProps } from '../components';
import { emerald500 } from '../constants/colors';
import { unicodeHash, vectorSum } from '../util';
import { after, others, whilst } from '../animations/flow';

// TODO INSTEAD OF NUMBERS FOR EVENTS, PASS THE WHOLE SUBTITLE INTO THE THING AND MAKE A HASH

export const subtitlesProps: McasTxtProps = {
    fontWeight: 900,
    fontFamily: 'San Francisco Text',
    fill: 'white',
    stroke: 'black',
    lineWidth: 2,
    fontSize: 60,
    justify: true,
};

function unpackPropsOrReference(
    propsOrRef: Reference<Rect> | RectProps | undefined,
    defaultProps: RectProps,
): [Reference<Rect>, RectProps] {
    // generated ref and default props
    if (propsOrRef == undefined) {
        return [createRef<Rect>(), defaultProps];
    }

    // generated ref and provided props
    if (typeof propsOrRef === 'object') {
        return [
            createRef<Rect>(),
            { ...defaultProps, ...(propsOrRef as RectProps) },
        ];
    }

    // provided ref and default props
    return [propsOrRef as Reference<Rect>, defaultProps];
}

export type AnimatedTranscriptAtom = [
    (
        container: Reference<Rect>,
        highlight: Reference<Rect>,
        text: McasTxt,
    ) => ThreadGenerator,
    McasTxt,
    number,
];
export type TranscriptAtom = McasTxt | AnimatedTranscriptAtom;

// flag to wait for provided animation
// to finish before moving onto the next
// TranscriptAtom
export const WAIT_FOR_ANIMATION: number = 0b0001;

export function mkSubtitles(
    view: View2D,
    transcript: TranscriptAtom[],
    container?: RectProps,
    highlight?: RectProps,
    eventPrefix?: string,
): ThreadGenerator;

export function mkSubtitles(
    view: View2D,
    transcript: TranscriptAtom[],
    containerRef?: Reference<Rect>,
    highlightRef?: Reference<Rect>,
    eventPrefix?: string,
): ThreadGenerator;

export function* mkSubtitles(
    view: View2D,
    transcript: TranscriptAtom[],
    containerOrContainerRef?: Reference<Rect> | RectProps,
    highlightOrHighlightRef?: Reference<Rect> | RectProps,
    eventPrefix?: string,
): ThreadGenerator {
    const random = useRandom();

    const [cont, contProps] = unpackPropsOrReference(containerOrContainerRef, {
        shadowBlur: 4,
        shadowColor: '000000aa',
        shadowOffset: [3, 4],
    });

    const [high, highProps] = unpackPropsOrReference(highlightOrHighlightRef, {
        radius: 12,
        fill: emerald500,
    });

    // highlight ref not passed in, need to add it
    if (
        typeof highlightOrHighlightRef === 'object' ||
        highlightOrHighlightRef === undefined
    ) {
        view.add(<Rect {...highProps} ref={high} />);
    }

    // container ref not passed in, need to add it
    if (
        typeof containerOrContainerRef === 'object' ||
        containerOrContainerRef === undefined
    ) {
        view.add(<Rect {...contProps} ref={cont}></Rect>);
    }

    const events = new Set();

    function mkEvent(desiredName: string): string {
        if (events.has(desiredName)) {
            return mkEvent(desiredName + '-' + random.nextInt(0, 10000));
        }

        events.add(desiredName);
        return desiredName;
    }

    for (let i = 0; i < transcript.length; ++i) {
        let t = transcript[i];
        let animator = all;

        if (t instanceof Array) {
            const [animation, text, FLAGS] = t as AnimatedTranscriptAtom;
            t = text;
            animator = (...tasks: ThreadGenerator[]) =>
                ((FLAGS & WAIT_FOR_ANIMATION) == 1 ? all : others)(
                    animation(cont, high, t as McasTxt),
                    ...tasks,
                );
        }

        const hash = unicodeHash(
            t
                .children()[0]
                .children()
                .map(x => x.text())
                .join(' '),
        );

        try {
            yield* waitUntil(
                mkEvent(
                    `${eventPrefix ?? ''}${(
                        t.children()[0].children()[0].children()[0] as McasTxt
                    ).text()} | ${hash}`,
                ),
            );
        } catch (e) {
            throw new Error(
                `Error in accessing children of transcript atom. If the error says "t.children()[0].children()[0] is undefined" you probably forgot to do <McasTxt justify /> or <McasTxt {...subtitlesProps} />.\n\nThe error is as follows:\n${e}`,
            );
        }
        cont().children(t);
        const children = cont().children()[0].children()[0].children();

        if (i == 0) {
            high().position(
                vectorSum(
                    (children[0] as McasTxt).position(),
                    new Vector2(0, 10),
                ),
            );
            high().size(
                vectorSum((children[0] as McasTxt).size(), new Vector2(40, 20)),
            );
        }

        const highlightMoves: ThreadGenerator[] = [];

        let childN = 0;

        for (let child of children) {
            const tasks = [
                high().position(
                    vectorSum(
                        (child as McasTxt).position(),
                        new Vector2(0, 10),
                    ),
                    0.1,
                ),
                high().size(
                    vectorSum((child as McasTxt).size(), new Vector2(40, 20)),
                    0.1,
                ),
            ];

            if (childN++ == 0) {
                highlightMoves.push(all(...tasks));
            } else {
                highlightMoves.push(
                    after(
                        mkEvent(
                            `${eventPrefix ?? ''}${(
                                child as McasTxt
                            ).text()} | ${hash}`,
                        ),
                        ...tasks,
                    ),
                );
            }
        }

        yield* animator(chain(...highlightMoves));
    }

    yield* waitUntil(
        `End mkSubtitles for prefix: ${eventPrefix ?? 'no prefix specified'}`,
    );

    cont().removeChildren();
    cont().remove();
    high().remove();
}

export const highFill =
    (newColour: PossibleColor, duration?: number) =>
    (_: any, high: Reference<Rect>) =>
        high().fill(newColour, duration ?? 0.1);
