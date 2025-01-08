// https://commons.wikimedia.org/wiki/File:Placeholder_no_text.svg

import { colorSignal, initial, Path, Rect, RectProps } from '@motion-canvas/2d';
import {
    ColorSignal,
    createRef,
    PossibleColor,
    Reference,
    SignalValue,
} from '@motion-canvas/core';
import { colors } from '../constants';

export interface PlaceholderPersonProps extends RectProps {
    headFill?: SignalValue<PossibleColor>;
    bodyFill?: SignalValue<PossibleColor>;
    headStroke?: SignalValue<PossibleColor>;
    bodyStroke?: SignalValue<PossibleColor>;
}

export class PlaceholderPerson extends Rect {
    @initial(colors.zinc50)
    @colorSignal()
    public declare readonly headFill: ColorSignal<this>;

    @initial(colors.zinc200)
    @colorSignal()
    public declare readonly bodyFill: ColorSignal<this>;

    @initial(colors.zinc50)
    @colorSignal()
    public declare readonly headStroke: ColorSignal<this>;

    @initial(colors.zinc200)
    @colorSignal()
    public declare readonly bodyStroke: ColorSignal<this>;

    public declare readonly headRef: Reference<Path>;
    public declare readonly bodyRef: Reference<Path>;

    public constructor(props?: PlaceholderPersonProps) {
        super(props);

        this.headRef = createRef<Path>();
        this.bodyRef = createRef<Path>();

        this.add(
            <Path
                layout={false}
                data="M 92.5675 89.6048 C 90.79484 93.47893 89.39893 102.4504 94.86478 106.9039 C 103.9375 114.2963 106.7064 116.4723 118.3117 118.9462 C 144.0432 124.4314 141.6492 138.1543 146.5244 149.2206 L 4.268444 149.1023 C 8.472223 138.6518 6.505799 124.7812 32.40051 118.387 C 41.80992 116.0635 45.66513 113.8823 53.58659 107.0158 C 58.52744 102.7329 57.52583 93.99267 56.43084 89.26926 C 52.49275 88.83011 94.1739 88.14054 92.5675 89.6048 z"
                fill={this.bodyFill}
                stroke={this.bodyStroke}
                ref={this.headRef}
                width="100%"
                height="100%"
                position={[-75, -90]}
            />,
        );

        this.add(
            <Path
                layout={false}
                data="M 104.68731,56.689353 C 102.19435,80.640493 93.104981,97.26875 74.372196,97.26875 55.639402,97.26875 46.988823,82.308034 44.057005,57.289941 41.623314,34.938838 55.639402,15.800152 74.372196,15.800152 c 18.732785,0 32.451944,18.493971 30.315114,40.889201 z"
                fill={this.headFill}
                stroke={this.headStroke}
                ref={this.bodyRef}
                width="100%"
                height="100%"
                position={[-75, -90]}
            />,
        );
    }
}
