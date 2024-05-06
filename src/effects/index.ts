import { Node } from "@motion-canvas/2d";
import { glow } from "./glow";

export * from "./glow";

export function effects(...e: ((n: Node) => Node)[]) {
  return (n: Node) => e.reduce((v, f) => f(v), n);
}
