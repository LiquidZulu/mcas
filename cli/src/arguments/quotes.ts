import { basename, resolve } from 'path';
import { readFile, mkdir, writeFile } from 'fs/promises';
import {
    getOrgQuotes,
    orgRichText,
    richTextToPango,
    pangoGreyParentheticals,
} from '../util/org';
import exec from 'exec-sh';
import imageSize from 'image-size';

export async function handleQuotes(filenames: string[]) {
    for (const file of filenames.map(x => resolve(x))) {
        const data = await readFile(file, { encoding: 'utf8' });
        const quotes = getOrgQuotes(data);
        const outDir = basename(file) + '-quotes';

        await mkdir(outDir, { recursive: true });

        let quoteImports = '';
        let defaultExport = 'export default [';

        for (let i = 0; i < quotes.length; ++i) {
            const rich = orgRichText(quotes[i].text);
            const pango = richTextToPango(rich, [
                pangoGreyParentheticals([/\[[^\]]+\]/g]),
            ]);
            const fileName = `${outDir}/quote-${i}.png`;

            const { stderr } = await exec.promise(
                `magick -background transparent -fill "white" -font Oswald -pointsize 32 -gravity Center -size 1080 -define pango:justify=true` +
                    ` "pango:${pango}"` +
                    ` ${fileName}`,
            );

            if (stderr) throw new Error(stderr);

            console.log(pango);

            const { height, width } = imageSize(fileName);

            quoteImports += `import { default as quote${i} } from './quote-${i}.png';\n`;
            defaultExport += `\n\t{ image: quote${i}, width: ${width}, height: ${height}, citation: ${JSON.stringify(
                quotes[i].citation,
            )}, author: "${quotes[i].author}" },`;
        }

        console.log(`Quotes for ${basename(file)} in ${resolve(outDir)}`);

        defaultExport += `\n];`;
        await writeFile(
            resolve(outDir, 'index.ts'),
            quoteImports + '\n\n' + defaultExport,
        );
    }
}
