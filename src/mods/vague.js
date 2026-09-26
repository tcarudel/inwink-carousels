/* Vague diagonale (famille 1) – classe crsl-vague – options : crsl-opt-molette, crsl-opt-auto */
CRSL.register("vague", { init: function (ct, list, C) {
  return C.track(ct, list, {
    loop: function (n) { return n >= 5; },
    render: function (e, x, W, set) {
      var ab = Math.abs(x), k = Math.max(-1, Math.min(1, x));
      set(e, "translateX(" + x * W * 0.62 + "px) translateY(" + x * 28 + "px) translateZ(" + (-ab * 110) + "px) rotateY(" + (-k * 38) + "deg) rotateZ(" + k * 4 + "deg)",
        C.clamp01(2.9 - ab), 100 - ab * 10, "brightness(" + (1 - Math.min(ab, 2) * 0.2) + ")");
    }
  });
} });
