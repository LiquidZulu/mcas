// https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
export const pipe =
  (...fns) =>
  x =>
    fns.reduce((v, f) => f(v), x);
