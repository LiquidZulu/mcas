import { makeScene2D, Txt } from "@motion-canvas/2d";
import { colors, effects, glow } from "../";

export default makeScene2D(function* (view) {
  view.fill(colors.bg);

  view.add(
    effects(
      <Txt fontFamily="Oswald" fontSize={150} fill="red">
        BLAH
      </Txt>
    ).glow()
  );
});
