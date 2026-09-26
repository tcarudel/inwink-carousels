/* Mise au point (famille 1) – classe crsl-focus – options : crsl-opt-molette, crsl-opt-auto, crsl-opt-compact
   Au survol (ou sur la carte active, pour le tactile) : le titre/bouton se révèlent et l'image zoome (CSS).
   En plus, tilt 3D au pointeur sur l'image (inspiré de vanilla-tilt : max 15°, scale 1.05, même easing/durée). */
CRSL.register("focus", { init: function (ct, list, C) {
  function tilt(e) {
    if (e._crslTilt) return; e._crslTilt = true;
    if (!e.querySelector("img")) return;
    e.addEventListener("pointermove", function (ev) {
      var r = e.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5, py = (ev.clientY - r.top) / r.height - 0.5;
      e.style.setProperty("--crsl-tilt-x", (px * 30).toFixed(2) + "deg");
      e.style.setProperty("--crsl-tilt-y", (-py * 30).toFixed(2) + "deg");
      e.style.setProperty("--crsl-tilt-s", "1.05");
    });
    e.addEventListener("pointerleave", function () {
      e.style.removeProperty("--crsl-tilt-x"); e.style.removeProperty("--crsl-tilt-y"); e.style.removeProperty("--crsl-tilt-s");
    });
  }
  return C.track(ct, list, {
    pad: 100, dragFactor: 0.7,
    loop: function (n) { return n >= 3; },
    init: function (e) { if (!C.reduce) tilt(e); },
    render: function (e, x, W, set) {
      var ab = Math.abs(x), m = Math.min(ab, 1);
      set(e, "translateX(" + x * W * 0.7 + "px) scale(" + (1 - m * 0.1) + ")",
        C.clamp01(3 - ab), 100 - ab * 10, "blur(" + (m * 6) + "px)");
    }
  });
} });
