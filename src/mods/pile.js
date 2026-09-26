/* Pile de cartes (famille 1) – classe crsl-pile – glisser la carte du dessus – options : crsl-opt-auto */
CRSL.register("pile", { init: function (ct, list, C) {
  return C.track(ct, list, {
    pad: 80, dragFactor: 1.2, loop: function (n) { return n >= 2; },
    rel: function (x, n) { x = C.mod(x, n); return x > n - 1 ? x - n : x; },
    render: function (e, x, W, set) {
      if (x < 0) set(e, "translateX(" + x * 130 + "%) rotate(" + x * 18 + "deg)", C.clamp01(1 + x), 200);
      else set(e, "translateY(" + x * 14 + "px) scale(" + Math.max(0.8, 1 - x * 0.05) + ")", C.clamp01(4.5 - x), 100 - x * 10);
    }
  });
} });
