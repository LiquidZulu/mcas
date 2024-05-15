type Fn<T, U> = (arg: T) => U;

// https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
export const pipe =
  <T>(...fns: Fn<T, any>[]): Fn<T, any> =>
  (x: T) =>
    fns.reduce((v, f) => f(v), x);
