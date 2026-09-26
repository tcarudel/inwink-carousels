/* Bandeau infini (famille 1) – classe crsl-bandeau – défile en continu, pause au survol */
CRSL.register("bandeau", { init: function (ct, list, C) {
  return C.track(ct, list, {
    pad: 40, dragFactor: 1.06, drift: 0.006, snap: false, clickCenter: false, nav: false,
    loop: function () { return true; },
    render: function (e, x, W, set) { set(e, "translateX(" + x * (W + 16) + "px)", 1, 1); }
  });
} });
