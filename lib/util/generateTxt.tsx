import { TRichText } from '../types/TRichText';
import { McasTxt as Txt, McasTxtProps } from '../components/McasTxt';

export const generateTxt = (text: TRichText[], props?: McasTxtProps): Txt =>
    (
        <>
            {text.map(t =>
                typeof t == 'string' ? (
                    <Txt text={t} {...props} />
                ) : (
                    <Txt {...t} {...props} />
                ),
            )}
        </>
    ) as Txt;
