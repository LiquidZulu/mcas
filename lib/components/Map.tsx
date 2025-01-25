import {
    Node,
    NodeProps,
    Rect,
    Img,
    ImgProps,
    initial,
    signal,
    RectProps,
    CameraProps,
    Camera,
    Path,
} from '@motion-canvas/2d';
import {
    SignalValue,
    SimpleSignal,
    createRef,
    createSignal,
} from '@motion-canvas/core';
import countries from '../assets/world map/countries';

export interface MapProps extends CameraProps {}

type Country = {
    path: string;
    name: string;
    code: string;
};

export class Map extends Camera {
    public declare readonly countries: Country[];

    public constructor(props?: MapProps) {
        super(props);

        this.countries = countries;

        for (let { path, name, code } of this.countries) {
            this.add(<Path data={path} />);
        }
    }
}
