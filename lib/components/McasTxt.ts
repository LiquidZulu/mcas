import { Txt, TxtProps, initial, signal } from '@motion-canvas/2d';
import {
    PossibleColor,
    SignalValue,
    SimpleSignal,
    createSignal,
    unwrap,
} from '@motion-canvas/core';

export interface McasTxtProps extends TxtProps {
    glow?: boolean | SignalValue<number>;
}

export class McasTxt extends Txt {
    @initial(false)
    @signal()
    public declare readonly glow: SimpleSignal<number, this>;

    public constructor(props?: McasTxtProps) {
        super(props);

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
    }
}
