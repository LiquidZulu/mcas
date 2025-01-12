import { Node, Txt, TxtProps, initial, signal } from '@motion-canvas/2d';
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

        for (let child of this.children()) {
            if (child.children().length == 0) {
                child.text(this.replacer(child.text()));
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
                child.text(this.replacer(child.text()));
                newChildren.push(child);
            }
        }
        return newChildren;
    }

    private replacer(text: string) {
        console.log('hellow');
        console.log(text);
        console.log(
            text
                .replaceAll(/(?<!\\)---/g, '—')
                .replaceAll(/\\---/g, '---')
                .replaceAll(/(?<!\\)\\therefore/g, '∴')
                .replaceAll(/\\\\therefore/g, String.raw`\therefore`)
                .replaceAll(/(?<!\\)\\dots/g, '…')
                .replaceAll(/\\\\dots/g, String.raw`\dots`),
        );
        return text
            .replaceAll(/(?<!\\)---/g, '—')
            .replaceAll(/\\---/g, '---')
            .replaceAll(/(?<!\\)\\therefore/g, '∴')
            .replaceAll(/\\\\therefore/g, String.raw`\therefore`)
            .replaceAll(/(?<!\\)\\dots/g, '…')
            .replaceAll(/\\\\dots/g, String.raw`\dots`);
    }
}
