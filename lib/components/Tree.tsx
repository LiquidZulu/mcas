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
    SignalValue,
    SimpleSignal,
    SpacingSignal,
    ThreadGenerator,
    Vector2,
    Vector2Signal,
} from '@motion-canvas/core';
import { colors } from '../constants';
import { McasTxt as Txt } from './McasTxt';
import { getLocalPos } from '../util';
import { fadein, fadeout } from '../animations';

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
    crush?: SignalValue<(depth: number) => number>;
    rayOffset?: SignalValue<number>;
    hidden?: boolean;
}

export class Tree extends Rect {
    private declare readonly tree: NTree;
    public declare treeRef: TreeReference;
    public declare readonly hidden: boolean;

    @initial(1)
    @signal()
    public declare readonly crush: SimpleSignal<
        (depth: number) => number,
        this
    >;

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

        // no clue why this is required, because I already did super() but for whatever reason if I don't manually do it everything breaks as of 2025-01-16
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
                    gap={this.gap}
                >
                    <Rect ref={ref.node}>{tree.node}</Rect>
                    <Rect ref={childrenCont} justifyContent="stretch" />
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
}
