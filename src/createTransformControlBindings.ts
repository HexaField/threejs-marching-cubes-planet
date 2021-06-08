import { MathUtils } from "three";
import { World } from "./World";

export const createTransformControlBindings = () => {
  window.addEventListener('keydown', (event) => {

    switch (event.keyCode) {

      case 81: // Q
        World.instance.transformControls.setSpace(World.instance.transformControls.space === "local" ? "world" : "local");
        break;

      case 16: // Shift
        World.instance.transformControls.setTranslationSnap(100);
        World.instance.transformControls.setRotationSnap(MathUtils.degToRad(15));
        World.instance.transformControls.setScaleSnap(0.25);
        break;

      case 87: // W
        World.instance.transformControls.setMode("translate");
        break;

      case 69: // E
        World.instance.transformControls.setMode("rotate");
        break;

      case 82: // R
        World.instance.transformControls.setMode("scale");
        break;

      case 187:
      case 107: // +, =, num+
        World.instance.transformControls.setSize(World.instance.transformControls.size + 0.1);
        break;

      case 189:
      case 109: // -, _, num-
        World.instance.transformControls.setSize(Math.max(World.instance.transformControls.size - 0.1, 0.1));
        break;

      case 88: // X
        World.instance.transformControls.showX = !World.instance.transformControls.showX;
        break;

      case 89: // Y
        World.instance.transformControls.showY = !World.instance.transformControls.showY;
        break;

      case 90: // Z
        World.instance.transformControls.showZ = !World.instance.transformControls.showZ;
        break;

      case 32: // Spacebar
        World.instance.transformControls.enabled = !World.instance.transformControls.enabled;
        break;

    }

  });

  window.addEventListener('keyup', function (event) {

    switch (event.keyCode) {

      case 16: // Shift
        World.instance.transformControls.setTranslationSnap(null);
        World.instance.transformControls.setRotationSnap(null);
        World.instance.transformControls.setScaleSnap(null);
        break;

    }

  });
}