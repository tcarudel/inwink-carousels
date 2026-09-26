/* Liste + aperçu (famille 1) – classe crsl-liste – l'image de l'item apparaît à côté du curseur au survol */
CRSL.register("liste", { init: function (ct, list, C) {
  var pv = C.el("div", "crsl-l-preview"), off = [];
  pv.setAttribute("aria-hidden", "true");
  ct.appendChild(pv);
  function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); off.push(function () { t.removeEventListener(ev, fn, o); }); }
  on(list, "pointerover", function (e) {
    if (e.pointerType !== "mouse") return;
    var it = e.target.closest(".inwink-item");
    if (!it || it.parentNode !== list) return;
    var img = C.largestSrc(it.querySelector(".crsl-f-picture img, .picture-wrapper img, img"));
    if (img) { pv.style.backgroundImage = C.cssUrl(img); pv.classList.add("crsl-on"); } else pv.classList.remove("crsl-on");
  });
  on(list, "pointermove", function (e) {
    var w = pv.offsetWidth, g = 40;
    pv.style.left = (e.clientX > w + g + 20 ? e.clientX - w - g : e.clientX + g) + "px";
    pv.style.top = e.clientY + "px";
  });
  on(list, "pointerleave", function () { pv.classList.remove("crsl-on"); });
  on(window, "scroll", function () { pv.classList.remove("crsl-on"); }, { passive: true });
  return { destroy: function () { off.forEach(function (f) { f(); }); pv.remove(); } };
} });
