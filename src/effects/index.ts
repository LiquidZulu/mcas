import { Node } from "@motion-canvas/2d";
import { glow } from "./glow";

export * from "./glow";

export function effects(n: Node) {
  return {
    glow: () => glow(n),
  };
}
