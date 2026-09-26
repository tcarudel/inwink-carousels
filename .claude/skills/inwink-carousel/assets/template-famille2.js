/* <Nom lisible> (famille 2) – classe crsl-<cle> – option : crsl-opt-auto
   Inspiration : <lien>
   Contrat : .crsl-f-picture, .crsl-f-title, .crsl-content (+ .crsl-f-color, .image-cutout facultatifs) */
CRSL.register("<cle>", { init: function (ct, list, C) {
  var data = [], n = 0, a = 0, busy = false;
  var st = C.scene(ct, "crsl-<cle>-stage");
  st.innerHTML = '<div class="crsl-k-bg"></div><div class="crsl-x-content crsl-k-content" aria-live="polite"></div><div class="crsl-k-controls"></div>';
  var bg = st.querySelector(".crsl-k-bg"), content = st.querySelector(".crsl-k-content");
  C.nav(st.querySelector(".crsl-k-controls"), go);

  function read() {
    data = C.items(list).map(C.fields); n = data.length;
    if (a >= n) a = 0;
    data.forEach(function (f) { if (f.img) new Image().src = f.img; }); // préchargement
  }
  function show(anim) {
    var f = data[a];
    bg.style.backgroundImage = C.cssUrl(f.img);
    bg.style.backgroundColor = f.color || "";
    if (f.color) st.style.setProperty("--crsl-accent", f.color); else st.style.removeProperty("--crsl-accent");
    C.mount(content, f, anim); // contenu de l'item, titre animé, liens redirigés vers l'original
  }
  function go(dir) {
    if (busy || n < 2) return; busy = true;
    a = C.mod(a + dir, n);
    // Transition : animer ici (Web Animations API), puis appeler show(true) et libérer busy.
    var anim = bg.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: C.reduce ? 1 : 500 });
    show(true);
    anim.onfinish = function () { busy = false; };
  }

  C.swipe(st, go); C.keys(st, go);
  var timer = C.autoplay(ct, st, go, 6000);
  var mo = C.watch(list, function () { if (!busy) { read(); if (n) show(false); } });
  read(); show(false);
  return { destroy: function () { clearInterval(timer); mo.disconnect(); C.unscene(ct, st); } };
} });
