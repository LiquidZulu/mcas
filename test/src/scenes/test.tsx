import { makeScene2D } from '@motion-canvas/2d';
import { all, waitFor, createRefArray } from '@motion-canvas/core';
import { colors, McasTxt as Txt, Accordion, AccordionItem } from '@lib/index';

export default makeScene2D(function* (view) {
    view.fill(colors.bg);

    const items = createRefArray<AccordionItem>();

    view.add(
        <Accordion width={640}>
            <AccordionItem ref={items} title="Accordion item 1" isOpen>
                <Txt fill="white">
                    Accordion content arbitrary {'\n'}blah blah blah blah blah
                    blah {'\n'}blah blah
                </Txt>
            </AccordionItem>
            <AccordionItem ref={items} title="Accordion item 2">
                <Txt fill="white">
                    Accordion content arbitrary {'\n'}blah blah blah blah blah
                    blah {'\n'}blah blah
                </Txt>
            </AccordionItem>
            <AccordionItem ref={items} title="Accordion item 3">
                <Txt fill="white">
                    Accordion content arbitrary {'\n'}blah blah blah blah blah
                    blah {'\n'}blah blah
                </Txt>
            </AccordionItem>
        </Accordion>,
    );

    yield* all(items[1].open(), items[0].close());
    yield* waitFor(1);
    yield* all(items[1].close(), items[0].open());
    yield* waitFor(1);
});
