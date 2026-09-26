/* Produit détouré (famille 2) – classe crsl-produit – option : crsl-opt-auto
   Fond = couleur de l'item. Image détourée (image-cutout) : produit flottant ; sinon photo dans un médaillon. */
CRSL.register("produit", { init: function (ct, list, C) {
  var data = [], n = 0, a = 0, busy = false;
  var st = C.scene(ct, "crsl-produit-stage");
  st.innerHTML = '<div class="crsl-p-ring"></div><div class="crsl-x-content crsl-p-content" aria-live="polite"></div>' +
    '<div class="crsl-p-product"><img alt=""></div><div class="crsl-p-controls"></div>';
  var content = st.querySelector(".crsl-p-content"), prod = st.querySelector(".crsl-p-product"), img = prod.querySelector("img");
  C.nav(st.querySelector(".crsl-p-controls"), go);
  var bubbles = [[8, 12, 70], [70, 8, 46], [88, 62, 90], [30, 78, 54], [62, 84, 36]].map(function (b, i) {
    var e = C.el("div", "crsl-p-bubble");
    e.style.cssText = "left:" + b[0] + "%;top:" + b[1] + "%;width:" + b[2] + "px;height:" + b[2] + "px;animation-delay:" + (-i * 0.9) + "s";
    st.insertBefore(e, content); return e;
  });
  function read() { data = C.items(list).map(C.fields); n = data.length; if (a >= n) a = 0; data.forEach(function (f) { if (f.img) new Image().src = f.img; }); }
  function show(anim) {
    var f = data[a];
    st.style.backgroundColor = f.color || "";
    if (f.color) st.style.setProperty("--crsl-accent", f.color); else st.style.removeProperty("--crsl-accent");
    prod.classList.toggle("crsl-framed", !f.cutout);
    prod.hidden = !f.img;
    if (f.img) { img.src = f.img; img.alt = f.title; }
    C.mount(content, f, anim);
    if (!anim || C.reduce) return;
    prod.animate([{ transform: "translateY(-120%) rotate(25deg)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 750, easing: "cubic-bezier(.2,.9,.25,1.15)" });
    bubbles.forEach(function (b, i) { b.animate([{ transform: "scale(0)" }, { transform: "scale(1.15)" }, { transform: "none" }], { duration: 700, delay: 150 + i * 60, fill: "backwards" }); });
  }
  function go(d) {
    if (busy || n < 2) return; busy = true;
    var done = function () { a = C.mod(a + d, n); show(true); busy = false; };
    if (C.reduce) return done();
    var out = prod.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(120%) rotate(-25deg)", opacity: 0 }], { duration: 450, easing: "ease-in", fill: "forwards" });
    out.onfinish = function () { out.cancel(); done(); };
  }
  C.swipe(st, go); C.keys(st, go);
  var timer = C.autoplay(ct, st, go, 6000);
  var mo = C.watch(list, function () { if (!busy) { read(); if (n) show(false); } });
  read(); show(false);
  return { destroy: function () { clearInterval(timer); mo.disconnect(); C.unscene(ct, st); } };
} });
