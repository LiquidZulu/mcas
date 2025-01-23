export const I = (a: any) => a;

/*
 * Parameterised sin function builder
 */
export function sinFactory(high?: number, low?: number, frequency?: number) {
    const hi = high ?? 1;
    const lo = low ?? 1;
    const f = frequency ?? 1;
    const A = (hi - lo) / 2;
    const B = (hi + lo) / 2;

    return (offset: number) => (x: number) =>
        A * Math.sin(x * 2 * Math.PI * f - offset * Math.PI) + B;
}
