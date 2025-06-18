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
    InterpolationFunction,
    PossibleColor,
    SignalValue,
    SimpleSignal,
    ThreadGenerator,
    TimingFunction,
    createEffect,
    createSignal,
    threadable,
    unwrap,
} from '@motion-canvas/core';
import { mkSignal } from '../util';
import { TxtLeaf } from '@motion-canvas/2d/lib/components/TxtLeaf';

export interface McasTxtProps extends TxtProps {
    glow?: boolean | SignalValue<number>;
    justify?: boolean;
    uppercase?: SignalValue<boolean>;
    lowercase?: SignalValue<boolean>;
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

    declare public readonly justify: boolean;

    @initial(false)
    @signal()
    declare public readonly glow: SimpleSignal<number, this>;

    @initial('white')
    @canvasStyleSignal()
    declare public readonly fill: CanvasStyleSignal<this>;

    @initial(false)
    @signal()
    declare public readonly uppercase: SimpleSignal<boolean>;

    @initial(false)
    @signal()
    declare public readonly lowercase: SimpleSignal<boolean>;

    public constructor(props?: McasTxtProps) {
        super(props);

        this.justify = props.justify;

        if (this.uppercase()) {
            this.text(this.text().toUpperCase());
            this.mkTextEffect(t => (this.uppercase() ? t.toUpperCase() : t));
        } else if (this.lowercase()) {
            this.text(this.text().toLowerCase());
            this.mkTextEffect(t =>
                this.lowercase() && !this.uppercase() ? t.toLowerCase() : t,
            );
        }

        if (this.justify) {
            // for some reason node.properties leads to errors, so I'm just selecting ones that I think people will care about
            const getProps = (node: McasTxt): McasTxtProps => ({
                stroke: node.stroke(),
                strokeFirst: node.strokeFirst(),
                lineWidth: node.lineWidth(),
                fill: node.fill(),
                glow: node.glow,
                fontFamily: node.fontFamily(),
                fontSize: node.fontSize(),
                fontWeight: node.fontWeight(),
                fontStyle: node.fontStyle(),
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

    public mkTextEffect(cb: (text: string) => string) {
        createEffect(() => {
            this.text(cb(this.text()));
        });
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
        const r =
            (...substitutions: Array<[string, string]>) =>
            (t: string) =>
                substitutions.reduce(
                    (v: string, [i, o]: [string, string]) =>
                        v
                            .replaceAll(
                                new RegExp(
                                    String.raw`(?<!\\)${
                                        i.substring(0, 1) == '\\' ? '\\' + i : i
                                    }`,
                                    'g',
                                ),
                                o,
                            )
                            .replaceAll(
                                new RegExp(
                                    String.raw`\\${
                                        i.substring(0, 1) == '\\' ? '\\' + i : i
                                    }`,
                                    'g',
                                ),
                                String.raw`\​${i.substring(1)}`,
                            ),
                    t,
                );

        return r(
            ['---', '—'],
            ['--', '–'],
            [String.raw`\therefore`, '∴'],
            [String.raw`\because`, '∵'],
            [String.raw`\dots`, '…'],
        )(text);

        return text
            .replaceAll(/(?<!\\)---/g, '—')
            .replaceAll(/\\---/g, '---')
            .replaceAll(/(?<!\\)--/g, '–')
            .replaceAll(/\\--/g, '--')
            .replaceAll(/(?<!\\)\\therefore/g, '∴')
            .replaceAll(/\\\\therefore/g, String.raw`\therefore`)
            .replaceAll(/(?<!\\)\\because/g, '∵')
            .replaceAll(/\\\\because/g, String.raw`\because`)
            .replaceAll(/(?<!\\)\\dots/g, '…')
            .replaceAll(/\\\\dots/g, String.raw`\dots`);
    }

    public childText(textNode?: Node) {
        const t = textNode ?? this;
        let text = '';

        for (let child of this.children()) {
            if (!('text' in child)) text += this.childText(child);
            else text += child.text();
        }

        return this.getText();
    }
}
