import { makeScene2D, Ray, Txt, Rect, Node } from '@motion-canvas/2d';
import { waitFor, chain, all, createRef } from '@motion-canvas/core';

export default function makeFootnote(num: number) {
    return makeScene2D(function* (view) {
        const footnote = {
            n: 200,
            height: 30,
            width: 55,
            lineWidth: 2,
            notchWidth: 5,
            x: 870,
            y: 480,
            fill: 0xffffff,
        };

        const refs = {
            notch: [
                createRef<Ray>(),
                createRef<Ray>(),
                createRef<Ray>(),
                createRef<Ray>(),
            ],
            bar: [createRef<Ray>(), createRef<Ray>()],
            txt: createRef<Txt>(),
        };

        view.add(
            <Node>
                <Rect
                    width={footnote.width}
                    height={footnote.height}
                    x={footnote.x + footnote.width / 2}
                    y={footnote.y + footnote.height / 2}
                >
                    <Txt
                        opacity={0}
                        ref={refs.txt}
                        paddingTop={0}
                        text={`${num}`}
                        fontFamily="Mononoki"
                        fontSize={footnote.height - 8}
                        fill={footnote.fill}
                    />
                </Rect>
                <Ray
                    ref={refs.bar[0]}
                    stroke={footnote.fill}
                    lineWidth={footnote.lineWidth}
                    x={footnote.x + footnote.width / 2}
                    fromY={footnote.y + footnote.height / 2}
                    toY={footnote.y + footnote.height / 2}
                />
                <Ray
                    ref={refs.notch[0]}
                    stroke={footnote.fill}
                    lineWidth={footnote.lineWidth}
                    y={footnote.y + footnote.lineWidth / 2}
                    x={footnote.x + footnote.width / 2}
                />
                <Ray
                    ref={refs.notch[2]}
                    stroke={footnote.fill}
                    lineWidth={footnote.lineWidth}
                    y={footnote.y + footnote.height - footnote.lineWidth / 2}
                    x={footnote.x + footnote.width / 2}
                />
                <Ray
                    ref={refs.bar[1]}
                    stroke={footnote.fill}
                    lineWidth={footnote.lineWidth}
                    x={footnote.x + footnote.width / 2}
                    fromY={footnote.y + footnote.height / 2}
                    toY={footnote.y + footnote.height / 2}
                />
                <Ray
                    ref={refs.notch[1]}
                    stroke={footnote.fill}
                    lineWidth={footnote.lineWidth}
                    y={footnote.y + footnote.lineWidth / 2}
                    x={footnote.x + footnote.width / 2}
                />
                <Ray
                    ref={refs.notch[3]}
                    stroke={footnote.fill}
                    lineWidth={footnote.lineWidth}
                    y={footnote.y + footnote.height - footnote.lineWidth / 2}
                    x={footnote.x + footnote.width / 2}
                />
            </Node>,
        );

        yield* all(
            refs.bar[0]().from([0, footnote.y], 0.4),
            refs.bar[0]().to([0, footnote.y + footnote.height], 0.4),
            refs.bar[1]().from([0, footnote.y], 0.4),
            refs.bar[1]().to([0, footnote.y + footnote.height], 0.4),
        );

        yield* waitFor(0.2);

        yield* all(
            refs.bar[0]().from([-footnote.width / 2, footnote.y], 0.4),
            refs.bar[0]().to(
                [-footnote.width / 2, footnote.y + footnote.height],
                0.4,
            ),
            refs.bar[1]().from([footnote.width / 2, footnote.y], 0.4),
            refs.bar[1]().to(
                [footnote.width / 2, footnote.y + footnote.height],
                0.4,
            ),
            refs.notch[0]().from(
                [-(footnote.width / 2) - footnote.lineWidth / 2, 0],
                0.4,
            ),
            refs.notch[0]().to(
                [-(footnote.width / 2) + footnote.notchWidth, 0],
                0.4,
            ),
            refs.notch[1]().from(
                [footnote.width / 2 + footnote.lineWidth / 2, 0],
                0.4,
            ),
            refs.notch[1]().to(
                [footnote.width / 2 - footnote.notchWidth, 0],
                0.4,
            ),
            refs.notch[2]().from(
                [-(footnote.width / 2) - footnote.lineWidth / 2, 0],
                0.4,
            ),
            refs.notch[2]().to(
                [-(footnote.width / 2) + footnote.notchWidth, 0],
                0.4,
            ),
            refs.notch[3]().from(
                [footnote.width / 2 + footnote.lineWidth / 2, 0],
                0.4,
            ),
            refs.notch[3]().to(
                [footnote.width / 2 - footnote.notchWidth, 0],
                0.4,
            ),
            chain(waitFor(0.2), refs.txt().opacity(1, 0.8)),
        );

        yield* waitFor(5);

        yield* all(
            refs.txt().opacity(0, 0.8),
            chain(
                waitFor(0.6),
                all(
                    refs.bar[0]().from([0, footnote.y], 0.4),
                    refs.bar[0]().to([0, footnote.y + footnote.height], 0.4),
                    refs.bar[1]().from([0, footnote.y], 0.4),
                    refs.bar[1]().to([0, footnote.y + footnote.height], 0.4),
                    refs.notch[0]().from([0, 0], 0.4),
                    refs.notch[0]().to([0, 0], 0.4),
                    refs.notch[1]().from([0, 0], 0.4),
                    refs.notch[1]().to([0, 0], 0.4),
                    refs.notch[2]().from([0, 0], 0.4),
                    refs.notch[2]().to([0, 0], 0.4),
                    refs.notch[3]().from([0, 0], 0.4),
                    refs.notch[3]().to([0, 0], 0.4),
                ),
            ),
        );

        yield* waitFor(0.2);

        yield* all(
            refs.bar[0]().from([0, footnote.y + footnote.height / 2], 0.4),
            refs.bar[1]().from([0, footnote.y + footnote.height / 2], 0.4),
            refs.bar[0]().to([0, footnote.y + footnote.height / 2], 0.4),
            refs.bar[1]().to([0, footnote.y + footnote.height / 2], 0.4),
        );
    });
}
