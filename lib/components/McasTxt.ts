import { Txt, TxtProps, initial, signal } from '@motion-canvas/2d';
import {
    PossibleColor,
    SignalValue,
    SimpleSignal,
    createSignal,
    unwrap,
} from '@motion-canvas/core';

export interface McasTxtProps extends TxtProps {
    glow?: SignalValue<boolean>;
}

export class McasTxt extends Txt {
    @initial(false)
    @signal()
    public declare readonly glow: SimpleSignal<boolean, this>;

    public constructor(props?: McasTxtProps) {
        super(props);

        if (props.glow) {
            this.shadowBlur(this.fontSize);
            this.shadowColor(this.fill as SignalValue<PossibleColor>);
        }
    }
}
