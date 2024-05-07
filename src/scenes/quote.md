
# Table of Contents

1.  [usage](#org64fa68f)



<a id="org64fa68f"></a>

# usage

`quote.ts` provides functions to make scenes, much like `footnote.ts`. The easiest way to use it is displayed in `quoteExample.tsx`:

    import { FullSceneDescription, ValueDispatcher } from '@motion-canvas/core';
    import { Txt } from '@motion-canvas/2d';
    
    import aristotle from '../assets/quote-assets/cards/aristotle.png';
    import lipsum from '../assets/quote-assets/text/lorem-ipsum.png';
    import { makeQuoteScene, b, i } from '../';
    
    export const aristotleQuote = makeQuoteScene(
      aristotle,
      lipsum,
      ['Aristotle, "Foo Bar Baz," in id., ', i('Lorem Ipsum'), ', pp. 69-420'],
      'quote-aristotle'
    );

This makes use of the richtext implementation found in `src/util/generateText.ts`.

