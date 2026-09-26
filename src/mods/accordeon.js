/* Accordéon horizontal (famille 1) – classe crsl-accordeon – le panneau survolé ou touché s'élargit */
CRSL.register("accordeon", { init: function (ct, list, C) {
  var it = [], active = 0, off = [];
  function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); off.push(function () { t.removeEventListener(ev, fn, o); }); }
  function paint() { it.forEach(function (e, i) { e.setAttribute("data-crsl-active", i === active ? "1" : "0"); }); }
  function collect() { it = C.items(list); if (active >= it.length) active = 0; paint(); }
  function set(i) { if (i > -1 && i < it.length && i !== active) { active = i; paint(); } }
  function idx(e) { var x = e.target.closest(".inwink-item"); return x && x.parentNode === list ? it.indexOf(x) : -1; }
  on(list, "pointerover", function (e) { if (e.pointerType === "mouse") set(idx(e)); });
  on(list, "focusin", function (e) { set(idx(e)); });
  on(list, "click", function (e) {
    var i = idx(e);
    if (i > -1 && i !== active) { e.preventDefault(); e.stopPropagation(); set(i); }
  }, true);
  on(ct, "keydown", function (e) {
    if (e.key === "ArrowRight") set(Math.min(it.length - 1, active + 1));
    if (e.key === "ArrowLeft") set(Math.max(0, active - 1));
  });
  var mo = new MutationObserver(collect);
  mo.observe(list, { childList: true });
  collect();
  return { destroy: function () {
    off.forEach(function (f) { f(); }); mo.disconnect();
    it.forEach(function (e) { e.removeAttribute("data-crsl-active"); });
  } };
} });
