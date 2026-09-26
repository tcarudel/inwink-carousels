/* Carte qui s'agrandit (famille 2) – classe crsl-carte – option : crsl-opt-auto
   Contrat : .crsl-f-picture, .crsl-f-title, .crsl-content (+ .crsl-f-color facultatif) */
CRSL.register("carte", { init: function (ct, list, C) {
  var data = [], n = 0, active = 0, busy = false;
  var st = C.scene(ct, "crsl-carte-stage");
  st.innerHTML = '<div class="crsl-c-bg"></div><div class="crsl-c-bg crsl-c-next"></div><div class="crsl-c-veil"></div>' +
    '<div class="crsl-x-content crsl-c-content" aria-live="polite"></div><div class="crsl-c-cards"></div>' +
    '<div class="crsl-c-controls"><div class="crsl-c-bar"><i></i></div><div class="crsl-c-count"></div></div>';
  var q = function (s) { return st.querySelector(s); };
  var bg = q(".crsl-c-bg"), bgNext = q(".crsl-c-next"), content = q(".crsl-c-content"), cards = q(".crsl-c-cards"),
      bar = q(".crsl-c-bar i"), count = q(".crsl-c-count"), controls = q(".crsl-c-controls");
  controls.insertBefore(C.nav(controls, function (d) { d > 0 ? go(0) : prev(); }), controls.firstChild);

  function paint(el, f) { el.style.backgroundImage = C.cssUrl(f.img); el.style.backgroundColor = f.color || ""; }
  function read() {
    data = C.items(list).map(C.fields); n = data.length;
    if (active >= n) active = 0;
    data.forEach(function (f) { if (f.img) new Image().src = f.img; });
  }
  function text(anim) {
    var f = data[active];
    C.mount(content, f, anim);
    if (f.color) st.style.setProperty("--crsl-accent", f.color); else st.style.removeProperty("--crsl-accent");
    count.textContent = active + 1;
    bar.style.width = ((active + 1) / n * 100) + "%";
  }
  function renderCards(anim) {
    cards.textContent = "";
    for (var k = 1; k < n; k++) {
      var f = data[(active + k) % n], b = C.el("button", "crsl-c-card");
      b.type = "button"; paint(b, f);
      b.setAttribute("aria-label", C.L.show + " : " + f.title);
      var s = C.el("span"); s.textContent = f.title; b.appendChild(s);
      b.addEventListener("click", go.bind(null, k - 1));
      cards.appendChild(b);
    }
    if (anim && !C.reduce && cards.lastElementChild)
      cards.lastElementChild.animate([{ opacity: 0, transform: "translateX(40px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "ease-out" });
  }
  function show(anim) { paint(bg, data[active]); text(anim); renderCards(anim); }
  function go(k) {
    if (busy || n < 2) return; busy = true;
    var all = [].slice.call(cards.children), card = all[k], target = (active + k + 1) % n;
    var s = st.getBoundingClientRect(), r = card.getBoundingClientRect();
    var from = { left: r.left - s.left + "px", top: r.top - s.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: "14px" };
    var ex = C.el("div", "crsl-c-expander"); paint(ex, data[target]); Object.assign(ex.style, from); st.appendChild(ex);
    card.style.visibility = "hidden";
    var dur = C.reduce ? 1 : 750, op = { duration: dur, easing: "cubic-bezier(.72,0,.18,1)", fill: "forwards" };
    var grow = ex.animate([from, { left: "0px", top: "0px", width: s.width + "px", height: s.height + "px", borderRadius: "0px" }], op);
    var stp = r.width + (parseFloat(getComputedStyle(cards).columnGap) || 0);
    all.forEach(function (c, i) { if (i !== k) c.animate([{ transform: "none" }, { transform: "translateX(" + (-stp * (k + 1)) + "px)", opacity: i < k ? 0 : 1 }], op); });
    content.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-20px)" }], { duration: dur * 0.45, easing: "ease-in", fill: "forwards" });
    grow.onfinish = function () {
      active = target; content.getAnimations().forEach(function (a) { a.cancel(); });
      show(true); ex.remove(); busy = false;
    };
  }
  function prev() {
    if (busy || n < 2) return; busy = true;
    active = (active - 1 + n) % n; paint(bgNext, data[active]);
    var dur = C.reduce ? 1 : 600;
    var fade = bgNext.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, easing: "ease-in-out" });
    var out = content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.4, fill: "forwards" });
    fade.onfinish = function () { out.cancel(); show(true); busy = false; };
  }
  function step(d) { d > 0 ? go(0) : prev(); }
  C.swipe(st, step); C.keys(st, step);
  var timer = C.autoplay(ct, st, step, 6000);
  var mo = C.watch(list, function () { if (!busy) { read(); if (n) show(false); } });
  read(); show(false);
  return { destroy: function () { clearInterval(timer); mo.disconnect(); C.unscene(ct, st); } };
} });
