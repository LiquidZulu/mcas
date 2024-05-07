import { SimpleSignal } from "@motion-canvas/core";

export type UnwrapSimpleSignal<T> = T extends SimpleSignal<infer U> ? U : never;
export type UnwrapSimpleSignals<T> = T extends infer A
  ? UnwrapSimpleSignal<A>
  : never;
