import { makeScene2D } from "@motion-canvas/2d";
import { Color, tween, createRef, easeInOutCubic } from "@motion-canvas/core";
import { McasTxt as Txt, colors } from "../";

export default makeScene2D(function* (view) {
  view.fill(colors.bg);

  const txt = createRef<Txt>();

  view.add(
    <Txt
      glow
      ref={txt}
      fontFamily="Oswald"
      fontSize={150}
      fill={new Color("red")}
    >
      BLAH
    </Txt>
  );

  yield* tween(2, (value) => {
    txt().fill(
      Color.lerp(new Color("red"), new Color("blue"), easeInOutCubic(value))
    );
  });

  yield* txt().fontSize(120, 3);
});
