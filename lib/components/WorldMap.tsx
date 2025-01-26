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
    colorSignal,
    Circle,
} from '@motion-canvas/2d';
import {
    Color,
    ColorSignal,
    InterpolationFunction,
    PossibleColor,
    PossibleVector2,
    Reference,
    ReferenceArray,
    SignalValue,
    SimpleSignal,
    TimingFunction,
    Vector2,
    createRef,
    createRefArray,
    createSignal,
} from '@motion-canvas/core';
import countries from '../assets/world map/countries';
import { zinc400 } from '../constants/colors';
import { vectorSum } from '../util';

export interface WorldMapProps extends RectProps {
    fill?: SignalValue<PossibleColor>;
    stroke?: SignalValue<PossibleColor>;
    lineWidth?: SignalValue<number>;
}

export type Country = {
    path: string;
    name: string;
    code: string;
    ref: Reference<Path>;
};

export type Coordinates =
    | string
    | PossibleVector2
    | { lat: number; long: number }
    | { north: number; east: number }
    | { n: number; e: number }
    | { north: number; west: number }
    | { n: number; w: number }
    | { south: number; east: number }
    | { s: number; e: number }
    | { south: number; west: number }
    | { s: number; w: number };

export function parseCoordinates(coords: Coordinates): Vector2 {
    if (typeof coords === 'string') {
        const matchs = coords.match(
            /(((\d+\.\d+)|(\d+))( |° )([nsewNSEW])), ((\d+\.\d+)|(\d+))( |° )([nsewNSEW])/,
        );

        if (!matchs) {
            throw new Error('Cannot parse coordinate string: ' + coords);
        }

        if (matchs[0] == coords) {
            const north = coords.match(/((\d+\.\d+)|(\d+))( |° )[nN]/);
            const east = coords.match(/((\d+\.\d+)|(\d+))( |° )[eE]/);
            const south = coords.match(/((\d+\.\d+)|(\d+))( |° )[sS]/);
            const west = coords.match(/((\d+\.\d+)|(\d+))( |° )[wW]/);

            let [x, y] = [0, 0];

            if (!!north) {
                y = +north[1];
            }

            if (!!east) {
                x = +east[1];
            }

            if (!!south) {
                y = -south[1];
            }

            if (!!west) {
                x = -west[1];
            }

            return new Vector2([x, y]);
        } else {
            throw new Error('Cannot parse coordinate string: ' + coords);
        }
    }

    if (typeof coords === 'object') {
        if ('lat' in coords && 'long' in coords) {
            return new Vector2([coords.long, coords.lat]);
        }

        if ('north' in coords) {
            if ('east' in coords) {
                return new Vector2([coords.east, coords.north]);
            }

            if ('west' in coords) {
                return new Vector2([-coords.west, coords.north]);
            }
        }

        if ('south' in coords) {
            if ('east' in coords) {
                return new Vector2([coords.east, -coords.south]);
            }

            if ('west' in coords) {
                return new Vector2([-coords.west, -coords.south]);
            }
        }

        if ('n' in coords) {
            if ('e' in coords) {
                return new Vector2([coords.e, coords.n]);
            }

            if ('w' in coords) {
                return new Vector2([-coords.w, coords.n]);
            }
        }

        if ('s' in coords) {
            if ('e' in coords) {
                return new Vector2([coords.e, -coords.s]);
            }

            if ('w' in coords) {
                return new Vector2([-coords.w, -coords.s]);
            }
        }
    }

    return new Vector2(coords);
}

export class WorldMap extends Rect {
    public declare readonly countries: { [key: string]: Country };
    private declare readonly paths: ReferenceArray<Path>;
    public declare readonly camera: Reference<Camera>;
    private declare readonly metacam: Reference<Camera>;
    private declare readonly metacamZoom: number;
    private declare readonly cont: Reference<Rect>;

    @initial(zinc400)
    @colorSignal()
    public declare readonly fill: ColorSignal<this>;

    @initial(zinc400)
    @colorSignal()
    public declare readonly stroke: ColorSignal<this>;

    @initial(1)
    @signal()
    public declare readonly lineWidth: SimpleSignal<number, this>;

    public constructor(props?: WorldMapProps) {
        super(props);

        this.metacam = createRef<Camera>();
        this.camera = createRef<Camera>();
        this.cont = createRef<Rect>();
        this.paths = createRefArray<Path>();
        this.countries = {};

        this.add(
            <Camera ref={this.metacam}>
                <Camera position={[505, 333]} ref={this.camera}>
                    <Rect ref={this.cont}>
                        {...countries.map(({ path }) => (
                            <Path
                                ref={this.paths}
                                data={path}
                                fill={this.fill}
                                stroke={this.stroke}
                                lineWidth={() =>
                                    this.lineWidth() /
                                    (3 * this.camera().zoom())
                                }
                            />
                        ))}
                    </Rect>
                </Camera>
            </Camera>,
        );
        for (let i = 0; i < this.paths.length; ++i) {
            const { path, name, code } = countries[i];

            this.countries[code] = {
                path,
                name,
                code,
                ref: () => this.paths[i],
            };
        }

        this.metacamZoom = 1.621;
        this.metacam().zoom(this.metacamZoom);
    }

    public place<T extends Node>(node: T, coords: Coordinates): void {
        this.cont().add(
            <Rect position={this.getPositionFromCoordinates(coords)}>
                {node}
            </Rect>,
        );
    }

    private getPositionFromCoordinates(coords: Coordinates): Vector2 {
        const { x, y } = parseCoordinates(coords);
        const R = 160.5;
        return vectorSum(
            new Vector2([
                R * x * (Math.PI / 180),
                R * Math.log(Math.tan(Math.PI / 4 - (y * (Math.PI / 180)) / 2)),
            ]),
            new Vector2([475, 463]),
        );
    }

    public *centerOn(
        coords: Coordinates,
        duration?: number,
        timingFunction?: TimingFunction,
        interpolationFunction?: InterpolationFunction<Vector2>,
    ) {
        yield* this.camera().centerOn(
            this.getPositionFromCoordinates(coords),
            duration ?? 1,
            timingFunction,
            interpolationFunction,
        );
    }

    public *zoom(
        zoomAmount: number,
        duration?: number,
        timingFunction?: TimingFunction,
        interpolationFunction?: InterpolationFunction<number, any[]>,
    ) {
        yield* this.camera().zoom(
            zoomAmount * this.metacamZoom,
            duration ?? 1,
            timingFunction,
            interpolationFunction,
        );
    }
}
