
# Table of Contents

1.  [Usage](#orgbb54f77)



<a id="orgbb54f77"></a>

# Usage

`footnote.ts` provides the `makeFootnote` function. You use it in your project.ts like:

    import { FullSceneDescription, makeProject } from "@motion-canvas/core";
    import { ValueDispatcher } from "@motion-canvas/core/lib/events";
    import makeFootnote from "./scenes/footnote";
    
    const foonotesScenes = new Array(200) // for 200 footnotes
       .fill(0)
       .map((_, i) => i + 1)
       .map((footnoteNumber) => ({
           footnoteNumber,
           scene: makeFootnote(footnoteNumber),
       }))
       .map(({ scene, footnoteNumber }) => {
           const description = scene as FullSceneDescription;
           description.name = `footnote-${footnoteNumber}`;
           description.onReplaced = new ValueDispatcher<FullSceneDescription>(
               description.config as any
           );
           return description;
    });
    
    export default makeProject({
       scenes: [
           ...footnotesScenes,
           // other scenes
       ]
    });

