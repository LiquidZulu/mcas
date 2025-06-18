export const isNonNullObject = (o: any) =>
    typeof o === 'object' && !(o === null);
