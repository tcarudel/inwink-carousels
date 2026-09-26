/* Slider d'équipe (famille 1) – classe crsl-equipe – options : crsl-opt-molette, crsl-opt-auto */
CRSL.register("equipe", { init: function (ct, list, C) {
  return C.track(ct, list, {
    pad: 80, dragFactor: 0.75,
    loop: function (n) { return n >= 4; },
    render: function (e, x, W, set) {
      var ab = Math.abs(x), m = Math.min(ab, 1);
      set(e, "translateX(" + x * W * 0.75 + "px) scale(" + (1 - m * 0.22) + ")", C.clamp01(3 - ab), 100 - ab * 10,
        "grayscale(" + m + ") brightness(" + (1 - m * 0.2) + ")");
    }
  });
} });
