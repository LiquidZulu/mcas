import { PossibleColor } from '@motion-canvas/core';
import { TRichText } from '../';

export const i = (text: string): TRichText => ({
    fontStyle: 'italic',
    text,
});
export const b = (text: string): TRichText => ({
    fontWeight: 700,
    text,
});
export const bi = (text: string): TRichText => ({
    fontStyle: 'italic',
    fontWeight: 700,
    text,
});
export const g = (text: string, color: PossibleColor): TRichText => ({
    fill: color,
    glow: true,
    text,
});
