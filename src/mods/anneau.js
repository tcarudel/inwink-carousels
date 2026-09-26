/* Anneau 3D vu de l'intérieur (famille 1) – classe crsl-anneau – tourne en continu, pause au survol */
CRSL.register("anneau", { init: function (ct, list, C) {
  return C.track(ct, list, {
    pad: 120, dragFactor: 1, drift: 0.004,
    loop: function (n) { return n >= 3; },
    render: function (e, x, W, set, i, n) {
      var A = 360 / n, R = Math.max(W * 1.3, (W / 2) / Math.tan(Math.PI / n) + W * 0.3), g = x * A;
      set(e, "perspective(1100px) translateZ(" + R + "px) rotateY(" + g + "deg) translateZ(" + (-R) + "px)",
        C.clamp01((95 - Math.abs(g)) / 35), 100 - Math.abs(g));
    }
  });
} });
