import { TRichText } from '../';
import { McasTxt as Txt } from '../';

export const generateTxt = (text: TRichText[]): Txt =>
    (
        <>
            {text.map(t =>
                typeof t == 'string' ? <Txt text={t} /> : <Txt {...t} />,
            )}
        </>
    ) as Txt;
