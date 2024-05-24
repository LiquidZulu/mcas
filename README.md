Motion Canvas Asset Set provides motion canvas assets that are frequently used on my YouTube channel ([LiquidZulu](https://youtube.com/liquidzulu)). This repository is currently under development, so do not count on it.


# Table of Contents

1.  [Installation](#org61c9b7e)
2.  [Usage](#org6c5545e)
    1.  [Documentation](#org60967f2)
    2.  [Examples](#org76b560f)


<a id="org61c9b7e"></a>

# Installation

MCAS is available as [an npm package](https://www.npmjs.com/package/mcas), and [on GitHub](https://github.com/LiquidZulu/mcas). For either method, if you want to use the cli you will have to add the location you downloaded mcas to to your [PATH](https://en.wikipedia.org/wiki/PATH_(variable)), which allows you to run the cli using the `mcas` script.

If you want to have MCAS installed as a local git repo, it is going to be helpful to make an alias to it in your tsconfig:

    {
        "compilerOptions": {
            "paths": {
                "@mcas/*": ["/path/to/where/you/cloned/mcas/*"]
            },
            ...
        },
        ...
    }

Which then allows you to reference MCAS in your project by doing:

    import { makeScene2D, Rect, Ray, Img } from '@motion-canvas/2d';
    import {
        all,
        chain,
        waitFor,
        createRef,
        createRefArray,
        createSignal,
    } from '@motion-canvas/core';
    import { colors, McasTxt as Txt, popin, popout } from '@mcas/lib';
    
    export default makeScene2D(function* (view) {
        view.fill(colors.bg);
    
        const glowingText = createRef<Txt>();
        view.add(
            <Txt glow fontFamily="Oswald" fill="red" ref={glowingText}>
                HELLO WORLD
            </Txt>,
        );
    
        yield* popin(glowingText);
        yield* waitFor(5);
        yield* popout(glowingText);
    });


<a id="org6c5545e"></a>

# Usage


<a id="org60967f2"></a>

## Documentation

Documentation is provided in the [lib](https://github.com/LiquidZulu/mcas/tree/main/lib) directory.


<a id="org76b560f"></a>

## Examples


### Generating Quote Scenes

The MCAS cli allows for the generation of quotes from provided [orgmode](https://orgmode.org/) documents. An example of this can be seen in [test/src/scenes/quoteExample.tsx](https://github.com/LiquidZulu/mcas/blob/main/test/src/scenes/quoteExample.tsx).

So, lets say that we have a video script called `script.org` that we want to generate quote scenes for. The first step is to pull the quotes out of the `.org` file into a format that can then be used by motion-canvas:

    mcas -q script.org

This will generate all of the relevant files in `./script.org-quotes`, including an `index.ts` ready to import into your animation. If you want to automatically generate a number of individual image sequences (this is recommended) from all of these quotes, then make a tsx file like:

    import john from './assets/quote-cards/john.png';
    import sally from './assets/quote-cards/sally.png';
    import nathan from './assets/quote-cards/nathan.png';
    // assuming that you stored the quote files in ./assets
    import quotes from './assets/script.org-quotes';
    import { makeQuoteScene } from 'mcas';
    
    // We need to have a way to select the correct png image
    // for each of our potential quote authors.
    const cardMap = new Map([
        ['john', john],
        ['sally', sally],
        ['nathan', nathan]
    ]);
    
    export const quoteScenes = quotes.map((x, i) =>
        makeQuoteScene(
            cardMap.get(x.author),  // the author image
            x,                      // information about the quote text png
            x.citation,             // the citation to use for this quote
            `quote-${i}`            // the name that motion-canvas will use to identify it
        )
    );

Then in the `project.ts` all of these scenes can be presented by doing:

    import { makeProject } from '@motion-canvas/core';
    import { quoteScenes } from './scenes/quoteExample';
    
    export default makeProject({
        experimentalFeatures: true,
        scenes: quoteScenes,
    });

If you want to also have other scenes rendering at the same time you can do:

    import { makeProject } from '@motion-canvas/core';
    import { quoteScenes } from './scenes/quoteExample';
    import someOtherScene from './scenes/someOtherScene?scene';
    
    export default makeProject({
        experimentalFeatures: true,
        scenes: [
            ...quoteScenes,
            someOtherScene
        ],
    });

