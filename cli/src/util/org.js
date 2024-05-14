import { pipe } from './pipe';

export function getOrgQuotes(text) {
  let rawQuotes = [];

  for (let quote of text.matchAll(/#\+begin_quote\n((.|\n)+?)#\+end_quote/g)) {
    rawQuotes.push(quote[0]);
  }

  return rawQuotes.map(x => x.split('\n').slice(1, -1).join('\n'));
}

const orgEffect = (char, name) => text => {
  let proc = [{ effects: [], text: '' }];
  if (text == '' || text == undefined) return proc;
  let inEffect = false;
  let i = 0;
  for (let letter of text.split('')) {
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

export const orgApplyEffect = effect => procText => {
  const newProc = [];

  for (let t of procText) {
    const effected = effect(t.text);

    for (let chunk of effected) {
      const prevEffects = t.effects;
      newProc.push({
        effects: prevEffects.concat(chunk.effects),
        text: chunk.text,
      });
    }
  }

  return newProc;
};

const filterBlankText = procText => procText.filter(({ text }) => text !== '');

export const orgBold = orgEffect('*', 'b');
export const orgItallic = orgEffect('/', 'i');
export const orgRichText = pipe(
  orgBold,
  orgApplyEffect(orgItallic),
  filterBlankText,
);
