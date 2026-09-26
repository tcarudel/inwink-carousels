/* Carrousel en verre (famille 1) – classe crsl-verre – options : crsl-opt-molette, crsl-opt-auto */
CRSL.register("verre", { init: function (ct, list, C) {
  var last = -1;
  return C.track(ct, list, {
    pad: 120, dragFactor: 1.08,
    render: function (e, x, W, set) {
      var ab = Math.abs(x);
      set(e, "translateX(" + x * (W + 20) + "px) scale(" + (1 - Math.min(ab, 1) * 0.15) + ")",
        Math.min(1 - Math.min(ab, 1) * 0.4, C.clamp01(3 - ab)), 100 - ab * 10);
    },
    after: function (i, it) {
      if (i === last || !it[i]) return;
      last = i;
      var img = C.largestSrc(it[i].querySelector(".crsl-f-picture img, .picture-wrapper img, img"));
      list.style.setProperty("--crsl-bgimg", C.cssUrl(img));
    },
    destroy: function () { list.style.removeProperty("--crsl-bgimg"); }
  });
} });
