import {
    Node,
    NodeProps,
    Rect,
    Img,
    ImgProps,
    initial,
    signal,
    vector2Signal,
    Vector2LengthSignal,
    Layout,
    LayoutProps,
    Circle,
    Ray,
    RayProps,
    Line,
    LineProps,
} from '@motion-canvas/2d';
import {
    PossibleVector2,
    SignalValue,
    SimpleSignal,
    Vector2,
    createRef,
    createRefArray,
    createSignal,
} from '@motion-canvas/core';
import { zinc200, purple500 } from '../constants/colors';
import { mkSignal } from '../util';

export type ChartType = 'line';
export type ChartAxes =
    | [string, string]
    | [SimpleSignal<string>, SimpleSignal<string>];
export type ChartDatum = [string, number] | [number, number];
export type ChartDatumSignal =
    | [SimpleSignal<string>, SimpleSignal<number>]
    | [SimpleSignal<number>, SimpleSignal<number>];
export type ChartData = Array<[string, number]> | Array<[number, number]>;
export type ChartDataSignal =
    | Array<[SimpleSignal<string>, SimpleSignal<number>]>
    | Array<[SimpleSignal<number>, SimpleSignal<number>]>;

export interface ChartProps extends LayoutProps {
    type: ChartType;
    axisLabels: ChartAxes;
    d: ChartData | ChartDataSignal;
    axisProps?: RayProps;
    lineProps?: LineProps;
}

// TODO:
// * make the axis labels
// * adjust the axes to be able to handle cases where some data is negative
// * allow one to pass in props to style the different components (Line, etc.)

/*
   <Chart
   type="line"
   axisLabels={['CO2 in atmosphere', 'year']}
   d={[
   ['1972', 300],
   ['1973', 400],
   ]}
   />
 */

export class Chart extends Layout {
    public readonly type: ChartType;
    public readonly axisLabels: ChartAxes;
    public readonly d: ChartData | ChartDataSignal;
    public readonly axes = createRefArray<Ray>();
    public readonly dataline = createRef<Line>();
    public readonly axisProps: RayProps;
    public readonly lineProps: LineProps;

    private bounds: SimpleSignal<[[number, number], [number, number]]>;
    private bucketed: boolean = false;

    public constructor(props?: ChartProps) {
        super(props);
        this.type = props.type;
        this.axisLabels = props.axisLabels;
        this.d = props.d;
        this.axisProps = props.axisProps;
        this.lineProps = props.lineProps;

        this.add(
            <Ray
                from={this.getBottomLeft()}
                to={this.getTopLeft()}
                stroke={zinc200}
                endArrow
                lineWidth={8}
                arrowSize={16}
                ref={this.axes}
                {...this.axisProps}
            />,
        );

        this.add(
            <Ray
                from={this.getBottomLeft()}
                to={this.getBottomRight()}
                stroke={zinc200}
                endArrow
                lineWidth={8}
                arrowSize={16}
                ref={this.axes}
                {...this.axisProps}
            />,
        );

        this.bounds = createSignal(() => {
            if (typeof this.d[0][0] === 'string') {
                this.bucketed = true;
                let min = mkSignal<number>(this.d[0][1])() as number;
                let max = mkSignal<number>(this.d[0][1])() as number;

                for (let [, amount] of this.d.slice(1)) {
                    const a = mkSignal<number>(amount as SignalValue<number>)();
                    if (a < min) min = a;
                    if (a > max) max = a;
                }

                return [
                    [NaN, NaN],
                    [min, max],
                ];
            } else {
                let min = new Vector2(
                    mkSignal(this.d[0][0] as number)() as number,
                    mkSignal(this.d[0][1] as number)() as number,
                );
                let max = new Vector2(
                    mkSignal(this.d[0][0] as number)() as number,
                    mkSignal(this.d[0][1] as number)() as number,
                );

                for (let [x, y] of this.d.slice(1)) {
                    const [ax, ay] = [
                        mkSignal(x as SignalValue<number>)(),
                        mkSignal(y as SignalValue<number>)(),
                    ];
                    if (ax < min.x) min.x = ax;
                    if (ax > max.x) max.x = ax;
                    if (ay < min.y) min.y = ay;
                    if (ay > max.y) max.y = ay;
                }
                return [
                    [min.x, max.x],
                    [min.y, max.y],
                ];
            }
        });

        this.bounds();

        this.add(
            <Line
                ref={this.dataline}
                zIndex={-1}
                stroke={purple500}
                shadowBlur={20}
                shadowColor={purple500}
                lineWidth={2}
                points={this.getPoints()}
                {...this.lineProps}
            />,
        );
    }

    public getPoints() {
        return this.d.map(datum => this.getBoundedPosition(datum));
    }

    public getBoundedPosition(datum: ChartDatum | ChartDatumSignal): Vector2 {
        const [da, db] = datum.map(x => mkSignal<string | number>(x));
        const [xBounds, [ymin, ymax]] = this.bounds();

        let x: number;

        if (this.bucketed) {
            x = this.getBucketedX(da() as any as string);
        } else {
            const [min, max] = xBounds;
            x = ((da() as number) - min) / (max - min);
        }

        const y = -(((db() as number) - ymin) / (ymax - ymin)) * this.height();

        return this.getPosition(x, y);
    }

    private getBucketedX(bucket: string): number {
        const buckets = this.d.length;

        for (let i = 0; i < buckets; ++i) {
            if (this.d[i][0] === bucket) {
                return (i / buckets) * this.width();
            }
        }

        return -1;
    }

    public getTopLeft() {
        return this.getPosition(0, -this.height());
    }
    public getTopRight() {
        return this.getPosition(this.width(), -this.height());
    }
    public getBottomLeft() {
        return this.getPosition(0, 0);
    }
    public getBottomRight() {
        return this.getPosition(this.width(), 0);
    }

    public getPosition(x: number, y: number): Vector2;
    public getPosition(position: PossibleVector2): Vector2;
    public getPosition(
        xOrPosition: PossibleVector2 | number,
        yOrNull?: number,
    ): Vector2 {
        const { x, y } = this.normalisePositionArguments(xOrPosition, yOrNull);
        return new Vector2(x - this.width() / 2, y + this.height() / 2);
    }

    private normalisePositionArguments(
        xOrPosition: PossibleVector2 | number,
        yOrNull?: number,
    ): Vector2 {
        let position = new Vector2();

        if (typeof xOrPosition === 'number') {
            position.x = xOrPosition;
            position.y = yOrNull ?? 0;
        } else {
            position = new Vector2(xOrPosition);
        }

        return new Vector2(position);
    }
}
