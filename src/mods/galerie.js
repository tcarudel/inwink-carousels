/* Galerie inclinée (famille 1) – classe crsl-galerie – options : crsl-opt-molette, crsl-opt-auto */
CRSL.register("galerie", { init: function (ct, list, C) {
  return C.track(ct, list, {
    pad: 140, dragFactor: 0.42,
    init: function (e, i) { e.setAttribute("data-crsl-n", (i < 9 ? "0" : "") + (i + 1)); },
    render: function (e, x, W, set) {
      var ab = Math.abs(x), z = ab < 1 ? 70 - ab * 140 : -70 - (ab - 1) * 70;
      set(e, "translateX(" + x * W * 0.42 + "px) translateZ(" + z + "px) rotateY(-28deg)", C.clamp01(4 - ab), 100 - ab * 10,
        "brightness(" + (1 - Math.min(ab, 1) * 0.35) + ")");
    }
  });
} });
