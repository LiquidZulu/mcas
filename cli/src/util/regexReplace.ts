export const regexReplace = (
    str: string,
    regex: RegExp,
    replacer: (x: string) => string,
): string => {
    try {
        let newStr = str;
        const matches = str.match(regex);

        if (!matches) return str;

        for (const match of matches) {
            newStr = newStr.replaceAll(match, replacer(match));
        }

        return newStr;
    } catch (e) {
        return str;
    }
};

export const regexReplaceAsync = async (
    str: string,
    regex: RegExp,
    replacer: (x: string) => Promise<string>,
): Promise<string> => {
    try {
        let newStr = str;
        const matches = str.match(regex);

        if (!matches) return str;

        for (const match of matches) {
            newStr = newStr.replaceAll(match, await replacer(match));
        }

        return newStr;
    } catch (e) {
        return str;
    }
};
