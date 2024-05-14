import {
  CanvasStyleSignal,
  Line,
  LineProps,
  Shape,
  initial,
  signal,
} from '@motion-canvas/2d';
import { createSignal, SimpleSignal } from '@motion-canvas/core/lib/signals';
import { Color } from '@motion-canvas/core/lib/types';
import { TCorners, TVec2 } from '../';
import { vectorSum } from '../util';

export interface SquigglyBorderProps extends LineProps {
  lineWidth?: SimpleSignal<number, Line>;
  duration?: SimpleSignal<number, Line>;
  offsetsList?: SimpleSignal<TCorners[], Line>;
  currentOffset?: SimpleSignal<number, Line>;
}

export class SquigglyBorder extends Line {
  @initial(5)
  @signal()
  public declare readonly lineWidth: SimpleSignal<number, this>;

  @initial(0xffffff)
  @signal()
  public declare readonly stroke: CanvasStyleSignal<this>;

  @initial(0.2)
  @signal()
  public declare readonly duration: SimpleSignal<number, this>;

  @initial(
    createSignal([
      {
        topLeft: [20, 5],
        topRight: [0, -10],
        bottomLeft: [-14, 12],
        bottomRight: [12, -8],
      },
      {
        topLeft: [-10, 7],
        topRight: [6, 12],
        bottomLeft: [-20, 17],
        bottomRight: [15, -12],
      },
      {
        topLeft: [15, -12],
        topRight: [-6, -6],
        bottomLeft: [7, 17],
        bottomRight: [-10, 12],
      },
      {
        topLeft: [-18, 14],
        topRight: [-12, -18],
        bottomLeft: [12, -17],
        bottomRight: [20, 12],
      },
      {
        topLeft: [14, 14],
        topRight: [18, 18],
        bottomLeft: [-18, -17],
        bottomRight: [-4, 15],
      },
    ]),
  )
  @signal()
  public declare readonly offsetsList: SimpleSignal<TCorners[], this>;

  @initial(0)
  @signal()
  public declare readonly currentOffset: SimpleSignal<number, this>;

  public constructor(props?: SquigglyBorderProps) {
    super({
      cache: true,
      ...props,
    });

    this.points(
      this.getThePoints(this.currentOffset() % this.offsetsList().length),
    );

    // make the border appear above its children
    for (let child of this.children()) {
      child.compositeOperation('destination-over');
    }
  }

  private getThePoints(offset: number): TVec2[] {
    return [
      vectorSum([
        [
          (this.children()[0] as Shape).topLeft().x,
          (this.children()[0] as Shape).topLeft().y,
        ],
        this.offsetsList()[Math.floor(offset % this.offsetsList().length)]
          .topLeft,
      ]),
      vectorSum([
        [
          (this.children()[0] as Shape).topRight().x,
          (this.children()[0] as Shape).topRight().y,
        ],
        this.offsetsList()[Math.floor(offset % this.offsetsList().length)]
          .topRight,
      ]),
      vectorSum([
        [
          (this.children()[0] as Shape).bottomRight().x,
          (this.children()[0] as Shape).bottomRight().y,
        ],
        this.offsetsList()[Math.floor(offset % this.offsetsList().length)]
          .bottomRight,
      ]),
      vectorSum([
        [
          (this.children()[0] as Shape).bottomLeft().x,
          (this.children()[0] as Shape).bottomLeft().y,
        ],
        this.offsetsList()[Math.floor(offset % this.offsetsList().length)]
          .bottomLeft,
      ]),
      vectorSum([
        [
          (this.children()[0] as Shape).topLeft().x,
          (this.children()[0] as Shape).topLeft().y,
        ],
        this.offsetsList()[Math.floor(offset % this.offsetsList().length)]
          .topLeft,
      ]),
    ];
  }

  public *wiggle(duration?: number) {
    this.currentOffset((this.currentOffset() + 1) % this.offsetsList().length);
    yield* this.points(
      this.getThePoints(this.currentOffset()),
      duration ?? this.duration(),
    );
  }
}
