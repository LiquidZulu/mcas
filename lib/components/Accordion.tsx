import {
    Node,
    NodeProps,
    initial,
    signal,
    Rect,
    Ray,
    TxtProps,
    Txt,
    Icon,
} from '@motion-canvas/2d';
import {
    Reference,
    SignalValue,
    SimpleSignal,
    all,
    chain,
    createRef,
    waitFor,
} from '@motion-canvas/core';

export interface AccordionProps extends NodeProps {
    width?: SignalValue<number>;
    gap?: SignalValue<number>;
    dividerWidth?: SignalValue<number>;
}

export class Accordion extends Node {
    @initial(650)
    @signal()
    public declare readonly width: SimpleSignal<number, this>;

    @initial(32)
    @signal()
    public declare readonly gap: SimpleSignal<number, this>;

    @initial(2)
    @signal()
    public declare readonly dividerWidth: SimpleSignal<number, this>;

    public constructor(props?: AccordionProps) {
        super(props);

        this.add(
            <Rect width={this.width} layout direction="column" gap={this.gap}>
                {...this.children().flatMap(x => [
                    x,
                    <Ray
                        lineWidth={this.dividerWidth}
                        stroke="grey"
                        toX={this.width}
                    />,
                ])}
            </Rect>,
        );
    }
}

export interface AccordionItemProps extends NodeProps {
    gap?: SignalValue<number>;
    titleProps?: TxtProps;
    title?: SignalValue<string>;
    isOpen?: boolean;
}

export class AccordionItem extends Node {
    @initial(15)
    @signal()
    public declare readonly gap: SimpleSignal<number, this>;

    @initial('')
    @signal()
    public declare readonly title: SimpleSignal<string, this>;

    public declare isOpen: boolean;
    public declare readonly titleProps: TxtProps;

    private declare readonly chevron: Reference<Icon>;
    private declare readonly wrapper: Reference<Rect>;
    private declare readonly wrapped: Reference<Rect>;

    public constructor(props?: AccordionItemProps) {
        super(props);

        this.isOpen = props.isOpen == undefined ? false : props.isOpen;
        this.chevron = createRef<Icon>();
        this.wrapped = createRef<Rect>();

        this.add(
            <Rect width="100%" gap={15} direction="column">
                <Rect
                    width="100%"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Txt fill="white" text={this.title} {...this.titleProps} />
                    <Icon
                        ref={this.chevron}
                        height={40}
                        icon="lucide:chevron-left"
                    />
                </Rect>
                <Rect ref={this.wrapped} clip>
                    {...this.children()}
                </Rect>
            </Rect>,
        );

        if (!this.isOpen) {
            this.wrapped().maxHeight(0);
            this.wrapped().opacity(0);
        } else {
            this.wrapped().opacity(1);
            this.chevron().rotation(-90);
        }
    }

    public *open(duration?: number) {
        if (this.isOpen) return;

        const d = duration ?? 1;

        console.log(this.wrappedHeight());

        yield* all(
            this.wrapped().maxHeight(this.wrappedHeight(), d),
            this.chevron().rotation(-90, d),
            chain(waitFor(d / 2), this.wrapped().opacity(1, d / 2)),
        );

        this.isOpen = true;
    }

    public *close(duration?: number) {
        if (!this.isOpen) return;

        const d = duration ?? 1;

        this.wrapped().maxHeight(this.wrappedHeight());

        yield* all(
            this.wrapped().opacity(0, d / 2),
            this.chevron().rotation(0, d),
            this.wrapped().maxHeight(0, 1),
        );

        this.isOpen = false;
    }

    public *toggle(duration?: number) {
        if (this.isOpen) {
            yield* this.close(duration);
        } else {
            yield* this.open(duration);
        }
    }

    public wrappedHeight() {
        return this.wrapped().cacheBBox().height;
    }
}
