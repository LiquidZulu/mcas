import { Node, Txt, TxtProps } from "@motion-canvas/2d";
import { Color, createSignal } from "@motion-canvas/core";

export function glow(txt: Node) {
  if (txt instanceof Txt)
    return (
      <Txt
        {...(txt as unknown as TxtProps)}
        shadowColor={createSignal(() => (txt.fill() as Color).serialize())}
        shadowBlur={createSignal(() => txt.fontSize())}
      />
    );

  return txt;
}
