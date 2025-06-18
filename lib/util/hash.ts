export function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0; // Unsigned 32-bit integer
}

const MAX_CODE_POINT = 0x10ffff + 1;

export function unicodeHash(input: string, length: number = 1): string {
  const hash = fnv1a(input);
  let result = '';
  let temp = hash;

  for (let i = 0; i < length; i++) {
    const codePoint = temp % MAX_CODE_POINT;
    result += String.fromCodePoint(codePoint);
    temp = Math.floor(temp / MAX_CODE_POINT);
  }

  return result;
}
