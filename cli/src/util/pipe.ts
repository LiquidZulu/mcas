export type Fn<T, U> = (arg: T) => U;

/* tslint:disable:max-line-length */
/* prettier-ignore */
export type PipeFns<A, B, C, D, E, F, G, H, I, J> =
  | [Fn<A,B>]
  | [Fn<A,B>, Fn<B,C>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>, Fn<E,F>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>, Fn<E,F>, Fn<F,G>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>, Fn<E,F>, Fn<F,G>, Fn<G,H>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>, Fn<E,F>, Fn<F,G>, Fn<G,H>, Fn<H,I>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>, Fn<E,F>, Fn<F,G>, Fn<G,H>, Fn<H,I>, Fn<I,J>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>, Fn<E,F>, Fn<F,G>, Fn<G,H>, Fn<H,I>, Fn<I,J>, Fn<J,any>]
  | [Fn<A,B>, Fn<B,C>, Fn<C,D>, Fn<D,E>, Fn<E,F>, Fn<F,G>, Fn<G,H>, Fn<H,I>, Fn<I,J>, Fn<J,any>, ...Array<Fn<any, any>>];
/* tslint:enable:max-line-length */

// https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
export const pipe =
    <A, B, C, D, E, F, G, H, I, J>(
        ...fns: PipeFns<A, B, C, D, E, F, G, H, I, J>
    ) =>
    (x: A) =>
        fns.reduce((v: any, f: Fn<any, any>) => f(v), x as any) as any;
