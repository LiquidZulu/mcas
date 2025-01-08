import { TRichText } from '../types/TRichText';
import { McasTxt as Txt, McasTxtProps } from '../components/McasTxt';

export const generateTxt = (text: TRichText[], props?: McasTxtProps): Txt =>
    (
        <Txt {...props}>
            {text.map(t =>
                typeof t == 'string' ? (
                    <Txt text={t} {...props} />
                ) : (
                    <Txt {...t} {...props} />
                ),
            )}
        </Txt>
    ) as Txt;
