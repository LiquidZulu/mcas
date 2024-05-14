import {
  Color,
  FullSceneDescription,
  Thread,
  ThreadGenerator,
  ValueDispatcher,
  all,
  createRef,
  createRefArray,
  join,
  linear,
  loop,
  loopUntil,
  run,
  waitFor,
} from '@motion-canvas/core';
import {
  makeScene2D,
  Layout,
  Rect,
  Ray,
  Img,
  Txt,
  Gradient,
} from '@motion-canvas/2d';

import { SquigglyBorder, TRichText, generateTxt } from '../';
import mark from '../assets/quote-assets/quote-marks.png';
import { resolve } from 'path';

export function makeQuoteScene(
  card: string,
  quoteText: { image: string; height: number; width: number },
  citationText: TRichText[],
  name: string,
): FullSceneDescription {
  const description = makeQuote(
    card,
    quoteText,
    citationText,
  ) as FullSceneDescription;
  description.name = name;

  description.onReplaced = new ValueDispatcher<FullSceneDescription>(
    description.config as any,
  );
  return description;
}

export function makeQuote(
  card: string,
  quoteText: { image: string; height: number; width: number },
  citationText: TRichText[],
) {
  return makeScene2D(function* (view) {
    const squiggly = createRef<SquigglyBorder>();
    const text = createRef<Img>();
    const marks = createRefArray<Img>();
    const rays = createRefArray<Ray>();
    const citation = createRef<Txt>();

    view.add(
      <Rect layout gap={128}>
        <Rect width={512} height={680}>
          <SquigglyBorder ref={squiggly}>
            <Rect layout={false} cache width={512} height={680} fill="white">
              <Img src={card} height={680} compositeOperation="source-in" />
            </Rect>
          </SquigglyBorder>
        </Rect>
        <Rect direction="column" gap={32}>
          <Rect alignItems="center" gap={16}>
            <Img ref={marks} height={40} src={mark} />
            <Ray ref={rays} lineWidth={8} toX={800} stroke="white" />
          </Rect>
          <Rect
            cache
            width={876}
            height={500}
            fill={
              new Gradient({
                type: 'linear',
                fromY: -250,
                toY: 250,
                stops: [
                  {
                    offset: 0.01,
                    color: new Color({
                      a: 0,
                      r: 0,
                      g: 0,
                      b: 0,
                    }),
                  },
                  {
                    offset: 0.2,
                    color: 'white',
                  },
                  {
                    offset: 0.8,
                    color: 'white',
                  },
                  {
                    offset: 0.99,
                    color: new Color({
                      a: 0,
                      r: 0,
                      g: 0,
                      b: 0,
                    }),
                  },
                ],
              })
            }
          >
            <Img
              compositeOperation="source-in"
              ref={text}
              src={quoteText.image}
              width={876}
              height={quoteText.height * (876 / quoteText.width)}
            />
          </Rect>
          <Rect alignItems="center" gap={16}>
            <Ray ref={rays} lineWidth={8} toX={-800} stroke="white" />
            <Img ref={marks} height={40} src={mark} rotation={180} />
          </Rect>
          <Txt
            ref={citation}
            fill="acacaf"
            fontFamily="mononoki"
            fontSize={32}
            textWrap={true}
            maxWidth={876}
          >
            {generateTxt(citationText)}
          </Txt>
        </Rect>
      </Rect>,
    );

    squiggly().opacity(0);
    squiggly().scale(0.8);

    marks.map(m => {
      m.opacity(0);
      m.scale(0.8);
    });
    rays.map(r => {
      r.end(0);
    });

    citation().opacity(0);
    citation().margin([50, 0, 50, 0]);

    text().opacity(0.01);
    text().margin([400, 0, 0, 0]);

    let loopSquiggly = true;

    yield run(function* () {
      while (loopSquiggly) {
        yield* squiggly().wiggle();
      }
    });

    yield* all(
      squiggly().opacity(1, 0.5),
      squiggly().scale(1, 0.5),
      ...marks.map(m => all(m.opacity(1, 0.5), m.scale(1, 0.5))),
      ...rays.map(r => r.end(1, 0.5)),
      citation().opacity(1, 0.5),
      citation().margin(0, 0.5),
      text().opacity(1, 0.5),
      text().margin(
        [-text().height() + 100, 0, 0, 0],
        text().height() / 17,
        linear,
      ),
    );

    yield* all(
      squiggly().opacity(0, 0.5),
      squiggly().scale(0.8, 0.5),
      ...marks.map(m => all(m.opacity(0, 0.5), m.scale(0.8, 0.5))),
      ...rays.map(r => r.start(1, 0.5)),
      citation().opacity(0, 0.5),
      citation().margin([50, 0, 50, 0], 0.5),
      text().opacity(0, 0.5),
    );

    loopSquiggly = false;
  });
}
