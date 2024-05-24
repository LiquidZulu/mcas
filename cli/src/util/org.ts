import { pipe, Fn } from './pipe';
import { TRichText } from '@internal/lib/types';
import { b, i, bi } from '@internal/lib/util/richTextUtils';
import slugify from 'slugify';

export type TOrgRichTextAtom = { effects: string[]; text: string };
export type TOrgRichText = TOrgRichTextAtom[];
export type TOrgQuote = {
    text: string;
    citation: TRichText[];
    author: string;
};

export function getOrgFootRefs(text: string): Map<
    string,
    {
        citation: TRichText[];
        author: string;
    }
> {
    const map = new Map();

    for (const raw of text.matchAll(/^\[fn:\d+].*/gm)) {
        const fn = raw[0].match(/\[fn:\d+]/g)[0];
        const sliced = raw[0].slice(fn.length);
        const author = slugify(sliced.split(',')[0], { lower: true });
        const citationRichText: TRichText[] = orgRichText(sliced).map(x => {
            if (x.effects.includes('b') && x.effects.includes('i')) {
                return bi(x.text);
            }

            if (x.effects.includes('b')) {
                return b(x.text);
            }

            if (x.effects.includes('i')) {
                return i(x.text);
            }

            return x.text;
        });

        map.set(fn, { citation: citationRichText, author } as {
            citation: TRichText[];
            author: string;
        });
    }

    return map;
}

export function getFootnoteFromOrg(text: string, quote: string): TOrgQuote {
    const fn = quote.match(/\[fn:\d+]/g)[0];
    const slicedQuote = quote.slice(0, -fn.length);
    const footrefs = getOrgFootRefs(text);
    return {
        text: slicedQuote,
        ...footrefs.get(fn),
    };
}

export function orgQuoteFootnoteHandler(
    text: string,
    quote: string,
): TOrgQuote[] {
    const quotes = [];
    for (const q of quote.matchAll(/(.|\n)*?\[fn:\d+]/g)) {
        quotes.push(getFootnoteFromOrg(text, q[0].trim()));
    }
    return quotes;
}

export function getOrgQuotes(text: string) {
    const quotes: TOrgQuote[] = [];

    for (const quote of text.matchAll(
        /#\+begin_quote\n((.|\n)+?)#\+end_quote/g,
    )) {
        quotes.push(
            ...orgQuoteFootnoteHandler(
                text,
                quote[0].split('\n').slice(1, -1).join('\n'),
            ),
        );
    }

    return quotes;
}

const orgEffect = (char: string, name: string) => (text: string) => {
    const proc: TOrgRichText = [{ effects: [], text: '' }];
    if (text == '' || text == undefined) return proc;
    let inEffect = false;
    let i = 0;
    for (const letter of text.split('')) {
        if (letter == char) {
            ++i;
            if (inEffect) {
                inEffect = false;
                proc.push({ effects: [], text: '' });
            } else {
                inEffect = true;
                proc.push({ effects: [name], text: '' });
            }
        } else {
            proc[i].text = `${proc[i].text}${letter}`;
        }
    }
    return proc;
};

export const orgApplyEffect =
    (effect: (text: string) => TOrgRichText) => (procText: TOrgRichText) => {
        const newProc = [];

        for (const t of procText) {
            const effected = effect(t.text);

            for (const chunk of effected) {
                const prevEffects = t.effects;
                newProc.push({
                    effects: prevEffects.concat(chunk.effects),
                    text: chunk.text,
                });
            }
        }

        return newProc;
    };

const filterBlankText = (procText: TOrgRichText) =>
    procText.filter(({ text }) => text !== '');

export const orgBold = orgEffect('*', 'b');
export const orgItallic = orgEffect('/', 'i');
export const orgRichText: Fn<string, TOrgRichText> = pipe(
    orgBold,
    orgApplyEffect(orgItallic),
    filterBlankText,
);

export function richTextToPango(richText: TOrgRichText) {
    let pango = '';

    for (const chunk of richText) {
        pango += `${chunk.effects.map(x => `<${x}>`).join('')}${
            chunk.text
        }${chunk.effects
            .reverse()
            .map(x => `</${x}>`)
            .join('')}`;
    }

    return pango;
}
