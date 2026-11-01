import {
    CanvasStyleSignal,
    Node,
    Rect,
    Txt,
    TxtProps,
    canvasStyleSignal,
    initial,
    signal,
    blur,
} from '@motion-canvas/2d';
import {
    Color,
    InterpolationFunction,
    PossibleColor,
    ReferenceArray,
    SignalValue,
    SimpleSignal,
    ThreadGenerator,
    TimingFunction,
    createEffect,
    createRefArray,
    createSignal,
    threadable,
    unwrap,
} from '@motion-canvas/core';
import { mkSignal } from '../util';
import { TxtLeaf } from '@motion-canvas/2d/lib/components/TxtLeaf';

export function neonLayers(input: PossibleColor, intensity = 1) {
    const c = new Color(input);
    const g = Math.max(0, intensity);

    return {
        // letterforms: tinted white, still recognisably the hue
        core: c.mix(new Color('#fff'), 0.55 + 0.25 * g, 'rgb'),
        layers: [
            { blur: 0.9, color: c.saturate(1.4).alpha(0.35 * g) }, // wash
            { blur: 0.4, color: c.saturate(0.8).alpha(0.75 * g) }, // bloom
            { blur: 0.12, color: c.mix('#fff', 0.45, 'rgb').alpha(0.95 * g) }, // hot rim
            { blur: 0.04, color: new Color('#ffffff').alpha(0.8 * g) }, // core spark
        ],
    };
}

export type GlowStyle = 'classic' | 'soft' | 'hot' | 'realistic';

export interface McasTxtProps extends TxtProps {
    glow?: boolean | SignalValue<number>;
    glowstyle?: SignalValue<GlowStyle>;
    justify?: boolean;
    uppercase?: SignalValue<boolean>;
    lowercase?: SignalValue<boolean>;
    writeOn?: SignalValue<number>;
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

    @initial(1)
    @signal()
    declare public readonly writeOn: SimpleSignal<number, this>;

    @initial(false)
    @signal()
    declare public readonly glow: SimpleSignal<number, this>;

    @initial('classic')
    @signal()
    declare public readonly glowstyle: SimpleSignal<GlowStyle, this>;

    @initial('white')
    @canvasStyleSignal()
    declare public readonly fill: CanvasStyleSignal<this>;

    @initial(false)
    @signal()
    declare public readonly uppercase: SimpleSignal<boolean>;

    @initial(false)
    @signal()
    declare public readonly lowercase: SimpleSignal<boolean>;

    declare public readonly chars: ReferenceArray<this>;

    public constructor(props?: McasTxtProps) {
        super(props);

        this.chars = createRefArray<this>();

        this.justify = props.justify;

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

        /* if (props?.glowstyle == null) {
         *     this.glowstyle('hot');
         * } */

        const style = () => this.glowstyle();

        if (this.glow() > 0 && style() === 'classic') {
            this.shadowBlur(() => this.fontSize() * Math.min(this.glow(), 1));
            this.shadowColor(this.fill as SignalValue<PossibleColor>);
            this.cache(false);
        } else if (this.glow() > 0) {
            this.shadowBlur(0);
            this.shadowColor('#0000');
            this.cache(true);
            this.cachePadding(() => this.fontSize() * Math.max(this.glow(), 1));
            this.compositeOperation('source-over');
        }

        for (let child of this.children()) {
            if (child.children().length == 0) {
                (child as any).text(this.replacer((child as any).text()));
            } else child.children(this.replace(child.children()));
        }

        if (this.uppercase()) {
            this.text(this.text().toUpperCase());
            this.mkTextEffect(t => (this.uppercase() ? t.toUpperCase() : t));
        } else if (this.lowercase()) {
            this.text(this.text().toLowerCase());
            this.mkTextEffect(t =>
                this.lowercase() && !this.uppercase() ? t.toLowerCase() : t,
            );
        }

        if ('writeOn' in props) {
            this.children(this.prepareWriteOn(this.children()));

            const nChildren = this.children().length;
            console.log(nChildren);

            for (let i = 0; i < nChildren; ++i) {
                this.children()[i].opacity(() =>
                    this.writeOn() >= (i + 1) / nChildren ? 1 : 0,
                );
            }
        }
    }

    protected override draw(context: CanvasRenderingContext2D): void {
        const style = this.glowstyle();
        const g = this.glow();
        if (style === 'classic' || style === 'realistic' || g <= 0) {
            super.draw(context);
            return;
        }

        const size = this.fontSize();
        context.save();
        context.globalCompositeOperation = 'lighter';

        if (style === 'soft') {
            context.save();
            context.globalAlpha *= 0.4 * g;
            context.filter = `blur(${size * 0.45}px)`;
            super.draw(context);
            context.restore();

            context.save();
            context.globalAlpha *= 0.7 * g;
            context.filter = `blur(${size * 0.16}px)`;
            super.draw(context);
            context.restore();

            context.filter = 'none';
            context.globalAlpha = 1;
            super.draw(context);
        } else {
            context.save();
            context.globalAlpha *= 0.55 * g;
            context.filter = `blur(${size * 0.7}px)`;
            super.draw(context);
            context.restore();

            context.save();
            context.globalAlpha *= 0.85 * g;
            context.filter = `blur(${size * 0.22}px)`;
            super.draw(context);
            context.restore();

            context.filter = 'none';
            context.globalAlpha = 1;
            super.draw(context);
            super.draw(context);
            if (g > 0.55) super.draw(context);

            context.save();
            context.globalAlpha *= 0.6 * g;
            context.filter = `blur(${size * 0.04}px)`;
            super.draw(context);
            context.restore();
        }

        context.restore();
    }

    public override render(context: CanvasRenderingContext2D): void {
        if (this.glowstyle() !== 'realistic' || this.glow() <= 0) {
            super.render(context);
            return;
        }
        if (this.absoluteOpacity() <= 0) return;

        const size = this.fontSize();
        const g = this.glow();
        const c = new Color(this.fill() as PossibleColor);

        const blooms = [
            { radius: size * 0.55, alpha: 0.45 * g },
            { radius: size * 0.22, alpha: 0.7 * g },
            { radius: size * 0.08, alpha: 0.95 * g },
        ];

        const cacheRect = this.worldSpaceCacheBBox();
        if (cacheRect.width === 0 || cacheRect.height === 0) return;

        const cache = this.cachedCanvas().canvas;
        const x = cacheRect.position.x;
        const y = cacheRect.position.y;

        const prevBlur = this.shadowBlur();
        const prevColor = this.shadowColor();
        const prevOp = this.compositeOperation();
        const prevFilters = this.filters();

        const blit = () => {
            context.save();
            this.transformContext(context);
            this.renderFromSource(context, cache, x, y);
            context.restore();
        };

        this.shadowBlur(0);
        this.shadowColor('#0000');
        this.compositeOperation('lighter');

        for (const layer of blooms) {
            this.opacity(layer.alpha);
            this.filters([blur(layer.radius)]);
            blit();
        }

        // tight white spark — still additive, still blurred a little
        this.opacity(0.85 * g);
        this.filters([blur(size * 0.03)]);
        blit();

        // sharp tube on top. keep lighter so the centre can clip toward white
        this.opacity(1);
        this.filters([]);
        this.compositeOperation('lighter');
        blit();

        this.shadowBlur(prevBlur);
        this.shadowColor(prevColor);
        this.compositeOperation(prevOp);
        this.filters(prevFilters);
        this.opacity(1);
    }

    private prepareWriteOn(children: Node[]): Node[] {
        let newChildren: Node[] = [];
        for (let child of children as (TxtLeaf | Txt | McasTxt)[]) {
            if (child.children().length > 1) {
                newChildren.push(...this.prepareWriteOn(child.children()));
            } else {
                for (let char of child.text()) {
                    newChildren.push(
                        new McasTxt({
                            ref: this.chars,
                            stroke: this.stroke,
                            strokeFirst: this.strokeFirst,
                            lineWidth: this.lineWidth,
                            fill: child.fill(),
                            glow: 'glow' in child ? child.glow : false,
                            fontFamily: this.fontFamily,
                            fontSize: this.fontSize,
                            fontWeight: child.fontWeight(),
                            fontStyle: child.fontStyle(),
                            scale: child.scale(),
                            text: char,
                        }),
                    );
                }
            }
        }

        return newChildren;
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

        console.log('Replacer gets: ', text);

        return r(
            ['---', '—'],
            ['--', '–'],
            [String.raw`\therefore`, '∴'],
            [String.raw`\because`, '∵'],
            [String.raw`\dots`, '…'],
            [String.raw`\longrightarrow`, '⟶'],
            [String.raw`\longleftarrow`, '⟵'],
            [String.raw`\longleftrightarrow`, '⟷'],
            [String.raw`\longleftimplies`, '⟸'],
            [String.raw`\longimplies`, '⟹'],
            [String.raw`\longrightimplies`, '⟹'],
            [String.raw`\longiff`, '⟺'],
            [String.raw`\leftimplies`, '⇐'],
            [String.raw`\implies`, '⇒'],
            [String.raw`\rightimplies`, '⇒'],
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
            else text += (child as McasTxt).text();
        }

        return this.getText();
    }
}
