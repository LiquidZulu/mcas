import {
    Circle,
    colorSignal,
    Img,
    initial,
    Node,
    Ray,
    Rect,
    RectProps,
    Shape,
    signal,
    Txt,
    Vector2LengthSignal,
    vector2Signal,
} from '@motion-canvas/2d';
import {
    all,
    Color,
    ColorSignal,
    createRef,
    createSignal,
    delay,
    Reference,
    sequence,
    SignalValue,
    SimpleSignal,
    SpacingSignal,
    ThreadGenerator,
    Vector2,
    Vector2Signal,
} from '@motion-canvas/core';
import { colors } from '../constants';
import { McasTxt } from './McasTxt';
import { getLocalPos, mkSignal } from '../util';
import { fadein, fadeout } from '../animations';
import { cyan500, rose500, violet500 } from '../constants/colors';

type NTree<T extends Shape = Shape> = {
    node: T;
    children?: NTree[];
};

type TreeReference<T extends Shape = Shape> = {
    node: Reference<T>;
    children?: { child: TreeReference; ray: Reference<Ray> }[];
};

export interface TreeProps extends RectProps {
    tree: NTree;
    crush?: SimpleSignal<(depth: number) => number>;
    rayOffset?: SignalValue<number>;
    hidden?: boolean;
}

export class Tree extends Rect {
    private declare readonly tree: NTree;
    public declare treeRef: TreeReference;
    public declare readonly hidden: boolean;
    public declare readonly crush: SimpleSignal<(depth: number) => number>;

    @initial(64)
    @vector2Signal({ x: 'columnGap', y: 'rowGap' })
    public declare readonly gap: Vector2LengthSignal<this>;

    @initial(10)
    @signal()
    public declare readonly rayOffset: SimpleSignal<number, this>;

    public constructor(props?: TreeProps) {
        super({
            layout: true,
            alignItems: 'center',
            direction: 'column',
            ...props,
        });

        this.treeRef = { node: createRef<any>(), children: [] };
        this.hidden = 'hidden' in props ? props.hidden : false;
        this.crush = (props.crush ??
            createSignal(() => (_: number) => 1)) as TreeProps['crush'];
        this.tree = props.tree;

        let depth = 0;

        const traverse = <T extends Node = Node>(
            tree: NTree,
            parent: T,
            depth: number,
            ref: TreeReference,
        ) => {
            const childrenCont = createRef<Rect>();

            parent.add(
                <Rect
                    layout
                    direction="column"
                    alignItems="center"
                    gap={this.rowGap}
                >
                    <Rect ref={ref.node}>{tree.node}</Rect>
                    <Rect
                        gap={this.columnGap}
                        ref={childrenCont}
                        justifyContent="stretch"
                    />
                </Rect>,
            );

            if (this.hidden) {
                ref.node().opacity(0);
            }

            if ('children' in tree) {
                // add the children
                for (let child of tree.children) {
                    ref.children.push({
                        ray: createRef<Ray>(),
                        child: {
                            node: createRef<any>(),
                            children: [],
                        },
                    }),
                        traverse(
                            child,
                            childrenCont(),
                            depth + 1,
                            ref.children[ref.children.length - 1].child,
                        );
                }

                // make the children even widths
                let widest = 0;

                for (let child of childrenCont().children()) {
                    widest = Math.max(widest, (child as any).width());
                }

                for (let child of childrenCont().children()) {
                    (child as any).width(
                        createSignal(() => widest / this.crush()(depth)),
                    );
                }

                // add the rays pointing at each child
                for (let i = 0; i < tree.children.length; ++i) {
                    const child = tree.children[i];
                    this.add(
                        <Ray
                            end={this.hidden ? 0 : 1}
                            ref={ref.children[i].ray}
                            lineWidth={4}
                            stroke="white"
                            from={() => {
                                const { x, y } = getLocalPos(
                                    tree.node.absolutePosition(),
                                    new Vector2([
                                        -this.position().x,
                                        (tree.node.height() * this.scale().y) /
                                            2 +
                                            this.rayOffset() * this.scale().y -
                                            this.position().y,
                                    ]),
                                );
                                return {
                                    x: x / this.scale().x,
                                    y: y / this.scale().y,
                                };
                            }}
                            to={() => {
                                const { x, y } = getLocalPos(
                                    child.node.absolutePosition(),
                                    new Vector2([
                                        -this.position().x,
                                        -(
                                            (child.node as any).height() *
                                            this.scale().y
                                        ) /
                                            2 -
                                            this.rayOffset() * this.scale().y -
                                            this.position().y,
                                    ]),
                                );
                                return {
                                    x: x / this.scale().x,
                                    y: y / this.scale().y,
                                };
                            }}
                            layout={false}
                        />,
                    );
                }
            }
        };

        traverse(this.tree, this, depth, this.treeRef);
    }

    public *show(delayy?: number) {
        function* traverse(ref: TreeReference): ThreadGenerator {
            yield* all(
                fadein(ref.node),
                delay(
                    delayy ?? 0.1,
                    all(
                        ...ref.children.map(({ child, ray }, i) =>
                            delay(
                                (delayy ?? 0.1) * i,
                                all(traverse(child), ray().end(1, 1)),
                            ),
                        ),
                    ),
                ),
            );
        }

        yield* traverse(this.treeRef);
    }

    public *hide(delayy?: number) {
        function* traverse(ref: TreeReference): ThreadGenerator {
            yield* all(
                fadeout(ref.node),
                delay(
                    delayy ?? 0.1,
                    all(
                        ...ref.children.map(({ child, ray }, i) =>
                            delay(
                                (delayy ?? 0.1) * i,
                                all(traverse(child), ray().start(1, 1)),
                            ),
                        ),
                    ),
                ),
            );
        }

        yield* traverse(this.treeRef);
    }

    public *highlight(delayy?: number) {
        function* h(ref: Reference<any>) {
            if (isTxt(ref)) {
                const initialColor = ref().children()[0].fill();
                const initialShadowColor = ref().children()[0].shadowColor();
                const initialBlur = ref().children()[0].shadowBlur();
                yield* all(
                    ref()
                        .children()[0]
                        .shadowBlur(
                            Math.max(initialBlur, ref().fontSize()),
                            0.5,
                        )
                        .to(initialBlur, 0.5),
                    ref()
                        .children()[0]
                        .shadowColor(rose500, 1 / 3)
                        .to(violet500, 1 / 3)
                        .to(initialShadowColor, 1 / 3),
                    ref()
                        .children()[0]
                        .fill(rose500, 1 / 3)
                        .to(violet500, 1 / 3)
                        .to(initialColor, 1 / 3),
                );
            } else if (ref() instanceof Ray) {
                const initialColor = ref().stroke();
                const initialShadowColor = ref().shadowColor();
                const initialBlur = ref().shadowBlur();
                yield* all(
                    ref()
                        .shadowBlur(
                            Math.max(initialBlur, ref().fontSize()),
                            0.5,
                        )
                        .to(initialBlur, 0.5),
                    ref()
                        .shadowColor(rose500, 1 / 3)
                        .to(violet500, 1 / 3)
                        .to(initialShadowColor, 1 / 3),
                    ref()
                        .stroke(rose500, 1 / 3)
                        .to(violet500, 1 / 3)
                        .to(initialColor, 1 / 3),
                );
            } else {
                const initialColor = ref().shadowColor();
                const initialBlur = ref().shadowBlur();
                yield* all(
                    ref()
                        .shadowBlur(
                            Math.max(initialBlur, ref().fontSize()),
                            0.5,
                        )
                        .to(initialBlur, 0.5),
                    ref()
                        .shadowColor(rose500, 1 / 3)
                        .to(violet500, 1 / 3)
                        .to(initialColor, 1 / 3),
                );
            }
        }
        function* traverse(ref: TreeReference): ThreadGenerator {
            yield* all(
                h(ref.node),
                delay(
                    delayy ?? 0.1,
                    sequence(
                        delayy ?? 0.1,
                        ...ref.children.map(({ child, ray }) =>
                            sequence(delayy ?? 0.1, h(ray), traverse(child)),
                        ),
                    ),
                ),
            );
        }
        function isTxt(r?: Reference<any>) {
            if (r().children && r() instanceof Rect) {
                return (
                    r()?.children()[0] instanceof Txt ||
                    r()?.children()[0] instanceof McasTxt
                );
            }
            return false;
        }
        yield* traverse(this.treeRef);
    }
}
