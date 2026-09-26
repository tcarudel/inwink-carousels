/* Écran en diagonale (famille 2) – classe crsl-diagonale – option : crsl-opt-auto
   Avec l'option d'item « image détourée » (classe image-cutout), l'image sort du cadre en biais. */
CRSL.register("diagonale", { init: function (ct, list, C) {
  var data = [], n = 0, a = 0, busy = false;
  var st = C.scene(ct, "crsl-diagonale-stage");
  st.innerHTML = '<div class="crsl-d-ghost" aria-hidden="true"></div><div class="crsl-d-panels"></div><img class="crsl-d-fg" alt="">' +
    '<div class="crsl-x-content crsl-d-content" aria-live="polite"></div><div class="crsl-d-pager"></div><div class="crsl-d-controls"></div>';
  var q = function (s) { return st.querySelector(s); };
  var ghost = q(".crsl-d-ghost"), panels = q(".crsl-d-panels"), fg = q(".crsl-d-fg"), content = q(".crsl-d-content"), pager = q(".crsl-d-pager");
  C.nav(q(".crsl-d-controls"), function (d) { go(a + d); });
  function read() {
    data = C.items(list).map(C.fields); n = data.length; if (a >= n) a = 0;
    pager.textContent = "";
    data.forEach(function (f, i) {
      if (f.img) new Image().src = f.img;
      var b = C.el("button"); b.type = "button"; b.setAttribute("aria-label", C.L.show + " : " + f.title);
      b.addEventListener("click", function () { go(i); }); pager.appendChild(b);
    });
  }
  function panel(f) {
    var p = C.el("div", "crsl-d-panel");
    p.style.backgroundColor = f.color || "";
    if (!f.cutout) p.style.backgroundImage = C.cssUrl(f.img);
    panels.appendChild(p); return p;
  }
  function text(anim) {
    var f = data[a];
    C.mount(content, f, anim);
    if (f.color) st.style.setProperty("--crsl-accent", f.color); else st.style.removeProperty("--crsl-accent");
    ghost.textContent = f.title;
    st.classList.toggle("crsl-cut", f.cutout && !!f.img);
    if (f.cutout && f.img) { fg.src = f.img; fg.alt = f.title; }
    [].forEach.call(pager.children, function (b, i) { b.classList.toggle("crsl-on", i === a); });
    if (!anim || C.reduce) return;
    ghost.animate([{ transform: "translate(-15%, -50%)", opacity: 0 }, { transform: "translate(0, -50%)", opacity: 1 }], { duration: 900, easing: "cubic-bezier(.2,.8,.2,1)" });
    if (f.cutout) fg.animate([{ opacity: 0, transform: "translateX(25%) scale(.95)" }, { opacity: 1, transform: "none" }], { duration: 800, delay: 350, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
  }
  function show() { panels.textContent = ""; panel(data[a]); text(false); }
  function go(i) {
    i = C.mod(i, n);
    if (busy || n < 2 || i === a) return; busy = true;
    a = i;
    var p = panel(data[a]), to = getComputedStyle(p).clipPath;
    p.animate([{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }, { clipPath: to }],
      { duration: C.reduce ? 1 : 850, easing: "cubic-bezier(.7,0,.2,1)" }).onfinish = function () {
      [].slice.call(panels.children).forEach(function (x) { if (x !== p) x.remove(); }); busy = false;
    };
    text(true);
  }
  function step(d) { go(a + d); }
  C.swipe(st, step); C.keys(st, step);
  var timer = C.autoplay(ct, st, step, 6000);
  var mo = C.watch(list, function () { if (!busy) { read(); if (n) show(); } });
  read(); show();
  return { destroy: function () { clearInterval(timer); mo.disconnect(); C.unscene(ct, st); } };
} });
