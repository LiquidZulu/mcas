import {
    CanvasStyleSignal,
    Node,
    Rect,
    Txt,
    TxtProps,
    canvasStyleSignal,
    initial,
    signal,
} from '@motion-canvas/2d';
import {
    PossibleColor,
    SignalValue,
    SimpleSignal,
    createSignal,
    unwrap,
} from '@motion-canvas/core';
import { pipe } from '../../cli/src/util/pipe';
import { regexReplace } from 'cli/src/util/regexReplace';

export interface McasTxtProps extends TxtProps {
    glow?: boolean | SignalValue<number>;
    justify?: boolean;
}

export class McasTxt extends Txt {
    /**
     * Create a bold text node.
     *
     * @remarks
     * This is a shortcut for
     * ```tsx
     * <Txt fontWeight={700} />
     * ```
     *
     * @param props - Additional text properties.
     */
    public static b(props: McasTxtProps) {
        return new McasTxt({ ...props, fontWeight: 700 });
    }

    /**
     * Create an italic text node.
     *
     * @remarks
     * This is a shortcut for
     * ```tsx
     * <Txt fontStyle={'italic'} />
     * ```
     *
     * @param props - Additional text properties.
     */
    public static i(props: McasTxtProps) {
        return new McasTxt({ ...props, fontStyle: 'italic' });
    }

    public declare readonly justify: boolean;

    @initial(false)
    @signal()
    public declare readonly glow: SimpleSignal<number, this>;

    @initial('white')
    @canvasStyleSignal()
    public declare readonly fill: CanvasStyleSignal<this>;

    public constructor(props?: McasTxtProps) {
        super(props);
        this.justify = props.justify;

        if (this.justify) {
            // for some reason node.properties leads to errors, so I'm just selecting ones that I think people will care about
            const getProps = (node: McasTxt): McasTxtProps => ({
                fill: node.fill(),
                glow: node.glow,
                fontFamily: node.fontFamily(),
                fontSize: node.fontSize(),
                fontWeight: node.fontWeight(),
                scale: node.scale(),
            });

            function flatten(
                children: McasTxt[],
                properties: McasTxtProps,
            ): Node[] {
                let newChildren: McasTxt[] = [];
                for (let child of children) {
                    if ('justify' in child && child.justify == false) {
                        newChildren.push(
                            (
                                <McasTxt {...properties}>{child}</McasTxt>
                            ) as McasTxt,
                        );
                    } else {
                        if (child.children().length > 0) {
                            newChildren = [
                                ...newChildren,
                                ...flatten(
                                    child.children() as McasTxt[],
                                    getProps(child as McasTxt),
                                ),
                            ] as McasTxt[];
                        } else {
                            for (let word of (child as any).text().split(' ')) {
                                if (word !== '') {
                                    newChildren.push(
                                        (
                                            <McasTxt {...properties}>
                                                {word}
                                            </McasTxt>
                                        ) as McasTxt,
                                    );
                                }
                            }
                        }
                    }
                }
                return newChildren;
            }
            const flatChildren = flatten(
                this.children() as McasTxt[],
                getProps(this),
            );
            this.removeChildren();
            this.add(
                <Rect
                    justifyContent="space-between"
                    layout
                    wrap="wrap"
                    gap={() => this.fontSize() / 3}
                >
                    {...flatChildren}
                </Rect>,
            );
        }

        if (props.glow == true) {
            this.glow = createSignal(1);
        } else if (props.glow == false) {
            this.glow = createSignal(0);
        }

        this.shadowBlur(
            createSignal(
                () => this.fontSize() * Math.min((this.glow as any)(), 1),
            ),
        );
        this.shadowColor(this.fill as SignalValue<PossibleColor>);
        for (let child of this.children()) {
            if (child.children().length == 0) {
                (child as any).text(this.replacer((child as any).text()));
            } else child.children(this.replace(child.children()));
        }
    }

    private replace(children: Node[]): Node[] {
        let newChildren = [];
        for (let child of children) {
            if (child.children().length > 0) {
                let babies = [];
                for (let baby of child.children()) {
                    baby.children(this.replace(baby.children()));
                    babies.push(baby);
                }
                child.children(babies);
                newChildren.push(child);
            } else {
                (child as any).text(this.replacer((child as any).text()));
                newChildren.push(child);
            }
        }
        return newChildren;
    }

    public replacer(text: string) {
        return text
            .replaceAll(/(?<!\\)---/g, '—')
            .replaceAll(/\\---/g, '---')
            .replaceAll(/(?<!\\)\\therefore/g, '∴')
            .replaceAll(/\\\\therefore/g, String.raw`\therefore`)
            .replaceAll(/(?<!\\)\\because/g, '∵')
            .replaceAll(/\\\\because/g, String.raw`\because`)
            .replaceAll(/(?<!\\)\\dots/g, '…')
            .replaceAll(/\\\\dots/g, String.raw`\dots`);
    }
}
