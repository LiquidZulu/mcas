import { pipe } from './pipe';

type TOrgRichTextAtom = { effects: string[]; text: string };
type TOrgRichText = TOrgRichTextAtom[];

export function getOrgQuotes(text: string) {
  const rawQuotes = [];

  for (const quote of text.matchAll(/#\+begin_quote\n((.|\n)+?)#\+end_quote/g)) {
    rawQuotes.push(quote[0]);
  }

  return rawQuotes.map(x => x.split('\n').slice(1, -1).join('\n'));
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
export const orgRichText = pipe(
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
