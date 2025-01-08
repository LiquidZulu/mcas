import { makeScene2D } from '@motion-canvas/2d';
import {
    FullSceneDescription,
    PossibleColor,
    ValueDispatcher,
    waitUntil,
} from '@motion-canvas/core';
import { colors } from '../constants';

// const footnotesScenes = new Array(999)
//   .fill(0)
//   .map((_, i) => i + 1)
//   .filter((x) => x > 91)
//   .map((footnoteNumber) => ({
//     footnoteNumber,
//     scene: makeFootnote(footnoteNumber),
//   }))
//   .map(({ scene, footnoteNumber }) => {
//     const description = scene as FullSceneDescription;
//     description.name = `footnotes/footnote-${footnoteNumber}`;
//     description.onReplaced = new ValueDispatcher<FullSceneDescription>(
//       description.config as any,
//     );
//     return description;
//   });

export function mkBlankScene(name?: string, fill?: PossibleColor) {
    const scene = makeScene2D(function* (view) {
        view.fill(fill ?? colors.bg);
        yield* waitUntil('blank scene end');
    });
    let description = scene as FullSceneDescription;
    description.name = name ?? 'blank scene';
    description.onReplaced = new ValueDispatcher<FullSceneDescription>(
        description.config as any,
    );
    return description;
}
