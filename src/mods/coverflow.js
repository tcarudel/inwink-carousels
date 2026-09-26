/* Coverflow 3D (famille 1) – classe crsl-coverflow – options : crsl-opt-molette, crsl-opt-auto */
CRSL.register("coverflow", { init: function (ct, list, C) {
  return C.track(ct, list, {
    pad: 120,
    render: function (e, x, W, set) {
      var ab = Math.abs(x), sg = x < 0 ? -1 : 1;
      set(e, "translateX(" + x * W * 0.55 + "px) translateZ(" + (-ab * 140) + "px) rotateY(" + (-sg * Math.min(ab, 1) * 45) + "deg)",
        C.clamp01(3 - ab), 100 - ab * 10, "brightness(" + (1 - Math.min(ab, 1) * 0.15) + ")");
    }
  });
} });
