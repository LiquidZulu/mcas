import { McasTxtProps, TRichText } from '../';
import { McasTxt as Txt } from '../';

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
