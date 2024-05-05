import { Node, Txt, TxtProps } from "@motion-canvas/2d";
import { Color } from "@motion-canvas/core";

export function glow(txt: Node) {
  if (txt instanceof Txt)
    return (
      <Txt
        {...(txt as unknown as TxtProps)}
        shadowColor={(txt.fill() as Color).serialize()}
        shadowBlur={txt.fontSize()}
      />
    );

  return txt;
}
