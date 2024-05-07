import { Txt, TxtProps } from '@motion-canvas/2d';
import { TRichText } from '../';

export const i = (text: string): TRichText => ({
  fontStyle: 'italic',
  text,
});
export const b = (text: string): TRichText => ({
  fontWeight: 700,
  text,
});

export const generateTxt = (text: TRichText[]): Txt =>
  (
    <>
      {text.map(t =>
        typeof t == 'string' ? <Txt text={t} /> : <Txt {...t} />
      )}
    </>
  ) as Txt;
