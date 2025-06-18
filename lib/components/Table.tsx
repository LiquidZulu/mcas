import {
    initial,
    Ray,
    RayProps,
    Rect,
    RectProps,
    Shape,
    signal,
    Txt,
    TxtProps,
} from '@motion-canvas/2d';
import {
    all,
    createRefArray,
    createSignal,
    InterpolationFunction,
    noop,
    Reference,
    ReferenceArray,
    sequence,
    SignalValue,
    SimpleSignal,
    ThreadGenerator,
    TimingFunction,
    Vector2,
} from '@motion-canvas/core';
import { fadein, fadeout } from '../animations';
import { slate300, slate600, stone800 } from '../constants/colors';
import { vectorSum, getLocalPos, mkSignal } from '../util';

export type TableDatum =
    | SignalValue<number>
    | SignalValue<string>
    | Shape
    | undefined;

export type TableDatumAnimationFunction = (datum: TableDatum) => CellAnimator;

export type AnimatedTableDatum = [AnimatorDefinition, TableDatum];

export type TableRecord = (TableDatum | AnimatedTableDatum)[];

export type CellAnimator = (cell: Rect) => ThreadGenerator;

export type HiddenDefinition = (cell: Rect) => void;

export type AnimatorDefinition = {
    in: CellAnimator;
    out: CellAnimator;
    hidden: HiddenDefinition;
};

export type SignalAnimator = (
    signal: SimpleSignal<number>,
    duration?: number,
    timingFunction?: TimingFunction,
    interpolationFunction?: InterpolationFunction<number, any[]>,
) => AnimatorDefinition;

const defaultSignalAnimator: SignalAnimator = (
    signal: SimpleSignal<number>,
    duration?: number,
    timingFunction?: TimingFunction,
    interpolationFunction?: InterpolationFunction<number, any[]>,
) => ({
    in: (cell: Rect) => {
        const initialValue = signal();
        signal(0);
        return all(
            fadein(() => cell),
            signal(
                initialValue,
                duration ?? 1,
                timingFunction,
                interpolationFunction,
            ),
        );
    },
    out: (cell: Rect) =>
        all(
            fadeout(() => cell),
            signal(0, duration ?? 1, timingFunction, interpolationFunction),
        ),
    hidden: (cell: Rect) => {
        cell.opacity(0);
    },
});

export type NodeAnimator = (
    node: Reference<Shape>,
    duration?: number,
    timingFunction?: TimingFunction,
    interpolationFunction?: InterpolationFunction<number, any[]>,
) => ThreadGenerator;

export type TableBordersFunction = (
    table: Table,
) => Map<Rect, BorderDefinition>;

export const tableBordersNone: TableBordersFunction = (_: Table) => new Map();

// none of the outside edges should have borders
export const tableBordersInternal: TableBordersFunction = (table: Table) => {
    const borderMap = new Map<Rect, BorderDefinition>();
    const rows = table.cells.length;
    const cols = rows > 0 ? table.cells[0].length : 0;

    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < cols; ++j) {
            const cell = table.cells[i][j];
            borderMap.set(cell, {
                left: j > 0, // Draw left border except for first column
                right: j < cols - 1, // Draw right border except for last column
                top: i > 0, // Draw top border except for first row
                bottom: i < rows - 1, // Draw bottom border except for last row
            });
        }
    }

    return borderMap;
};

export const tableBordersMain: TableBordersFunction = (table: Table) => {
    const borderMap = new Map<Rect, BorderDefinition>();
    const rows = table.cells.length;
    const cols = rows > 0 ? table.cells[0].length : 0;

    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < cols; ++j) {
            const cell = table.cells[i][j];
            const borders: BorderDefinition = {
                left: false,
                right: false,
                top: false,
                bottom: false,
            };

            if (i === 0) {
                borders.right = j < cols - 1;
                borders.bottom = true;
            }

            borderMap.set(cell, borders);
        }
    }

    return borderMap;
};

export const tableBordersHeader: TableBordersFunction = (table: Table) => {
    const borderMap = new Map<Rect, BorderDefinition>();
    const rows = table.cells.length;
    const cols = rows > 0 ? table.cells[0].length : 0;

    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < cols; ++j) {
            const cell = table.cells[i][j];
            const borders: BorderDefinition = {
                left: false,
                right: false,
                top: false,
                bottom: false,
            };

            if (i === 0) {
                borders.bottom = true;
            }

            borderMap.set(cell, borders);
        }
    }

    return borderMap;
};

export const tableBordersHorizontalInternal: TableBordersFunction = (
    table: Table,
) => {
    const borderMap = new Map<Rect, BorderDefinition>();
    const rows = table.cells.length;
    const cols = rows > 0 ? table.cells[0].length : 0;

    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < cols; ++j) {
            const cell = table.cells[i][j];
            borderMap.set(cell, {
                left: false,
                right: false,
                top: i > 0, // Draw top border except for first row
                bottom: i < rows - 1, // Draw bottom border except for last row
            });
        }
    }

    return borderMap;
};

export const tableBordersAll: TableBordersFunction = (table: Table) => {
    const borderMap = new Map<Rect, BorderDefinition>();

    for (let i = 0; i < table.cells.length; ++i) {
        for (let j = 0; j < table.cells[i].length; ++j) {
            const cell = table.cells[i][j];
            borderMap.set(cell, {
                left: true,
                right: true,
                top: true,
                bottom: true,
            });
        }
    }

    return borderMap;
};

export type BorderDefinition = {
    left: boolean | RayProps;
    right: boolean | RayProps;
    top: boolean | RayProps;
    bottom: boolean | RayProps;
};

export interface TableProps extends RectProps {
    data: TableRecord[];
    signalAnimator?: SignalAnimator;
    borders?: TableBordersFunction;
    numberEntryStyle?: TxtProps;
    stringEntryStyle?: TxtProps;
    cellWidth?: SignalValue<number>;
    cellHeight?: SignalValue<number>;
    hidden?: boolean;
    mainBordersFunction?: TableBordersFunction;
    mainBordersStyle?: RayProps;
    secondaryBordersStyle?: RayProps;
}

export class Table extends Rect {
    declare public readonly data: TableProps['data'];
    declare public readonly signalAnimator: TableProps['signalAnimator'];
    declare public readonly borders: TableProps['borders'];
    declare public readonly numberEntryStyle: TableProps['numberEntryStyle'];
    declare public readonly stringEntryStyle: TableProps['stringEntryStyle'];
    declare public readonly records: ReferenceArray<Rect>;
    declare public readonly cells: ReferenceArray<Rect>[];
    declare public readonly rays: ReferenceArray<Ray>;
    declare public readonly animators: Map<Rect, AnimatorDefinition>;
    declare public readonly hidden: boolean;
    declare public readonly mainBordersFunction: TableProps['mainBordersFunction'];
    declare public readonly mainBordersStyle: TableProps['mainBordersStyle'];
    declare public readonly secondaryBordersStyle: TableProps['secondaryBordersStyle'];

    @initial(300)
    @signal()
    declare public readonly cellWidth: SimpleSignal<number>;

    @initial(70)
    @signal()
    declare public readonly cellHeight: SimpleSignal<number>;

    public constructor(props?: TableProps) {
        super({
            direction: 'column',
            gap: 0,
            ...props,
            layout: true,
        });

        this.data = props.data;
        this.signalAnimator = props.signalAnimator ?? defaultSignalAnimator;
        this.borders = props.borders ?? tableBordersInternal;
        this.numberEntryStyle = props.numberEntryStyle ?? {
            fontFamily: 'mononoki',
            fill: slate300,
        };
        this.stringEntryStyle = props.stringEntryStyle ?? {
            fill: 'white',
        };

        this.records = createRefArray<Rect>();
        this.cells = [];
        this.rays = createRefArray<Ray>();
        this.animators = new Map();
        this.hidden = !!props.hidden;
        this.mainBordersFunction =
            props.mainBordersFunction ?? tableBordersMain;
        this.mainBordersStyle = props.mainBordersStyle ?? {
            lineWidth: 8,
            stroke: 'white',
            zIndex: 1,
        };
        this.secondaryBordersStyle = props.secondaryBordersStyle ?? {
            lineWidth: 4,
            stroke: stone800,
        };

        const maxLength = Math.max(...this.data.map(record => record.length));

        // populate the table
        for (let i = 0; i < this.data.length; ++i) {
            let record = this.data[i];
            if (record.length < maxLength) {
                record = [
                    ...record,
                    ...Array(maxLength - record.length).fill(undefined),
                ];
            }

            this.add(
                <Rect
                    ref={this.records}
                    direction={this.direction() == 'column' ? 'row' : 'column'}
                    gap={0}
                />,
            );
            const ref = this.records[this.records.length - 1];
            this.cells.push(createRefArray<Rect>());

            for (let datum of record) {
                let defaultAnimation = true;
                let [d, a]: [
                    TableDatum | AnimatedTableDatum,
                    AnimatorDefinition,
                ] = [
                    datum,
                    {
                        in: (..._: any) => noop(),
                        out: (..._: any) => noop(),
                        hidden: (cell: Rect) => {
                            cell.opacity(0);
                        },
                    },
                ];

                // normalise animated datum
                if (d instanceof Array) {
                    defaultAnimation = false;
                    [a, d] = d as AnimatedTableDatum;
                }

                // Create a cell Rect for all content
                const cell = (
                    <Rect
                        ref={this.cells[i]}
                        width={this.cellWidth}
                        height={this.cellHeight}
                        layout
                        grow={1}
                        justifyContent="center"
                        alignItems="center"
                    />
                );
                ref.add(cell);

                // datum is signal
                if (typeof d === 'function') {
                    // datum is number signal
                    if (typeof d() === 'number') {
                        if (defaultAnimation)
                            a = this.signalAnimator(d as SimpleSignal<number>);
                        this.animators.set(cell as Rect, a);
                        cell.add(
                            <Txt
                                textAlign="center"
                                {...this.numberEntryStyle}
                                text={() => (d() as number).toFixed(0)}
                            />,
                        );
                        continue;
                    }

                    // datum is string signal
                    if (defaultAnimation)
                        a = {
                            in: (cell: Rect) => fadein(() => cell),
                            out: (cell: Rect) => fadeout(() => cell),
                            hidden: (cell: Rect) => {
                                cell.opacity(0);
                            },
                        };
                    this.animators.set(cell as Rect, a);
                    cell.add(
                        <Txt
                            textAlign="center"
                            {...this.stringEntryStyle}
                            text={d as SignalValue<string>}
                        />,
                    );
                    continue;
                }

                // datum is number
                if (typeof d === 'number') {
                    const s = createSignal(d);
                    if (defaultAnimation) a = this.signalAnimator(s);
                    this.animators.set(cell as Rect, a);
                    cell.add(
                        <Txt
                            textAlign="center"
                            {...this.numberEntryStyle}
                            text={() => (s() as number).toFixed(0)}
                        />,
                    );
                    continue;
                }

                // datum is string
                if (typeof d === 'string') {
                    const s = createSignal(d);
                    if (defaultAnimation)
                        a = {
                            in: (cell: Rect) => fadein(() => cell),
                            out: (cell: Rect) => fadeout(() => cell),
                            hidden: (cell: Rect) => {
                                cell.opacity(0);
                            },
                        };

                    this.animators.set(cell as Rect, a);
                    cell.add(
                        <Txt
                            textAlign="center"
                            {...this.stringEntryStyle}
                            text={s}
                        />,
                    );
                    continue;
                }

                // datum is shape
                if (d instanceof Shape) {
                    if (defaultAnimation)
                        a = {
                            in: (cell: Rect) => fadein(() => cell),
                            out: (cell: Rect) => fadeout(() => cell),
                            hidden: (cell: Rect) => {
                                cell.opacity(0);
                            },
                        };

                    this.animators.set(cell as Rect, a);
                    cell.add(d);
                    continue;
                }
            }
        }

        // make borders
        const borderMap = this.borders(this);
        const mainBorders = this.mainBordersFunction(this);

        const rayExists = (f: Vector2, t: Vector2) =>
            !(
                this.rays.find(ray => {
                    return (
                        (ray.from().equals(f) && ray.to().equals(t)) ||
                        (ray.from().equals(t) && ray.to().equals(f))
                    );
                }) == undefined
            );

        for (const [cell, { left, right, top, bottom }] of borderMap) {
            const mainBordersCell = mainBorders.get(cell);

            if (left) {
                const rayProps =
                    typeof left === 'boolean'
                        ? mainBordersCell.left
                            ? this.mainBordersStyle
                            : this.secondaryBordersStyle
                        : (left as RayProps);

                const [f, t] = [
                    createSignal(
                        () =>
                            new Vector2(
                                vectorSum(cell.position(), [
                                    -this.cellWidth() / 2,
                                    0,
                                ]).x,
                                this.top().y,
                            ),
                    ),
                    createSignal(
                        () =>
                            new Vector2(
                                vectorSum(cell.position(), [
                                    -this.cellWidth() / 2,
                                    0,
                                ]).x,
                                this.bottom().y,
                            ),
                    ),
                ];

                if (!rayExists(f(), t()))
                    this.add(
                        <Ray
                            {...rayProps}
                            ref={this.rays}
                            layout={false}
                            from={f}
                            to={t}
                        />,
                    );
            }

            if (right) {
                const rayProps =
                    typeof right === 'boolean'
                        ? mainBordersCell.right
                            ? this.mainBordersStyle
                            : this.secondaryBordersStyle
                        : (right as RayProps);

                const [f, t] = [
                    createSignal(
                        () =>
                            new Vector2(
                                vectorSum(cell.position(), [
                                    +cell.width() / 2,
                                    0,
                                ]).x,
                                this.top().y,
                            ),
                    ),
                    createSignal(
                        () =>
                            new Vector2(
                                vectorSum(cell.position(), [
                                    +cell.width() / 2,
                                    0,
                                ]).x,
                                this.bottom().y,
                            ),
                    ),
                ];

                if (!rayExists(f(), t()))
                    this.add(
                        <Ray
                            {...rayProps}
                            ref={this.rays}
                            layout={false}
                            from={f}
                            to={t}
                        />,
                    );
            }

            if (top) {
                const rayProps =
                    typeof top === 'boolean'
                        ? mainBordersCell.top
                            ? this.mainBordersStyle
                            : this.secondaryBordersStyle
                        : (top as RayProps);

                const [f, t] = [
                    createSignal(
                        () =>
                            new Vector2(
                                this.left().x -
                                    Math.max(
                                        mkSignal(
                                            this.mainBordersStyle.lineWidth,
                                        )(),
                                        mkSignal(
                                            this.secondaryBordersStyle
                                                .lineWidth,
                                        )(),
                                    ) /
                                        2,
                                vectorSum(cell.parent().position(), [
                                    0,
                                    -cell.height() / 2,
                                ]).y,
                            ),
                    ),
                    createSignal(
                        () =>
                            new Vector2(
                                this.right().x +
                                    Math.max(
                                        mkSignal(
                                            this.mainBordersStyle.lineWidth,
                                        )(),
                                        mkSignal(
                                            this.secondaryBordersStyle
                                                .lineWidth,
                                        )(),
                                    ) /
                                        2,
                                vectorSum(cell.parent().position(), [
                                    0,
                                    -cell.height() / 2,
                                ]).y,
                            ),
                    ),
                ];

                if (!rayExists(f(), t()))
                    this.add(
                        <Ray
                            {...rayProps}
                            ref={this.rays}
                            layout={false}
                            from={f}
                            to={t}
                        />,
                    );
            }

            if (bottom) {
                const rayProps =
                    typeof bottom === 'boolean'
                        ? mainBordersCell.bottom
                            ? this.mainBordersStyle
                            : this.secondaryBordersStyle
                        : (bottom as RayProps);

                const [f, t] = [
                    createSignal(
                        () =>
                            new Vector2(
                                this.left().x -
                                    mkSignal(rayProps.lineWidth)() / 2,
                                vectorSum(cell.parent().position(), [
                                    0,
                                    cell.height() / 2,
                                ]).y,
                            ),
                    ),
                    createSignal(
                        () =>
                            new Vector2(
                                this.right().x +
                                    mkSignal(rayProps.lineWidth)() / 2,
                                vectorSum(cell.parent().position(), [
                                    0,
                                    cell.height() / 2,
                                ]).y,
                            ),
                    ),
                ];

                if (!rayExists(f(), t()))
                    this.add(
                        <Ray
                            {...rayProps}
                            ref={this.rays}
                            layout={false}
                            from={f}
                            to={t}
                        />,
                    );
            }
        }

        if (this.hidden) {
            this.hide();
        }
    }

    public hide() {
        for (let record of this.cells) {
            for (let cell of record) {
                this.animators.get(cell).hidden(cell);
            }
        }

        for (let ray of this.rays) {
            ray.end(0);
        }
    }

    public *in(delay?: number) {
        const d = delay ?? 0.1;
        const anis = [];

        for (let [cell, ani] of this.animators) {
            anis.push(ani.in(cell));
        }

        yield* sequence(
            d,
            sequence(d, ...anis),
            sequence(d, ...this.rays.map(ray => ray.end(1, 1))),
        );
    }

    public *out(delay?: number) {
        const d = delay ?? 0.1;
        const anis = [];

        for (let [cell, { out }] of this.animators) {
            anis.push(out(cell));
        }

        yield* sequence(
            d,
            sequence(d, ...anis),
            sequence(d, ...this.rays.map(ray => ray.start(1, 1))),
        );
    }
}
