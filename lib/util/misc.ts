export const commaSeparators = (
    num: number | string,
    separator?: string,
    divisionSize?: number,
) =>
    num
        .toString()
        .replace(
            new RegExp(
                String.raw`\B(?=(\d{${divisionSize ?? 3}})+(?!\d))`,
                'g',
            ),
            separator ?? ',',
        );
