/* Transition en rideau (famille 2) – classe crsl-rideau – option : crsl-opt-auto */
CRSL.register("rideau", { init: function (ct, list, C) {
  var data = [], n = 0, a = 0, busy = false;
  var st = C.scene(ct, "crsl-rideau-stage");
  st.innerHTML = '<div class="crsl-r-layers"></div><div class="crsl-r-veil"></div><div class="crsl-x-content crsl-r-content" aria-live="polite"></div>' +
    '<div class="crsl-r-controls"><div class="crsl-r-count"></div></div>';
  var layers = st.querySelector(".crsl-r-layers"), content = st.querySelector(".crsl-r-content"),
      controls = st.querySelector(".crsl-r-controls"), count = st.querySelector(".crsl-r-count");
  controls.insertBefore(C.nav(controls, go), controls.firstChild);
  function layer(f) {
    var l = C.el("div", "crsl-r-layer");
    l.style.backgroundImage = C.cssUrl(f.img); l.style.backgroundColor = f.color || "";
    layers.appendChild(l); return l;
  }
  function read() { data = C.items(list).map(C.fields); n = data.length; if (a >= n) a = 0; data.forEach(function (f) { if (f.img) new Image().src = f.img; }); }
  function text(anim) {
    var f = data[a]; C.mount(content, f, anim);
    if (f.color) st.style.setProperty("--crsl-accent", f.color); else st.style.removeProperty("--crsl-accent");
    count.textContent = (a + 1) + " / " + n;
  }
  function show() { layers.textContent = ""; layer(data[a]); text(false); }
  function go(dir) {
    if (busy || n < 2) return; busy = true;
    a = C.mod(a + dir, n);
    var l = layer(data[a]);
    var from = dir > 0 ? "polygon(100% 0, 130% 0, 100% 100%, 100% 100%)" : "polygon(-30% 0, 0 0, 0 100%, -30% 100%)";
    l.animate([{ clipPath: from }, { clipPath: "polygon(-30% 0, 130% 0, 100% 100%, 0 100%)" }],
      { duration: C.reduce ? 1 : 900, easing: "cubic-bezier(.7,0,.2,1)" }).onfinish = function () {
      while (layers.children.length > 1) layers.firstChild.remove(); busy = false;
    };
    text(true);
  }
  C.swipe(st, go); C.keys(st, go);
  var timer = C.autoplay(ct, st, go, 6000);
  var mo = C.watch(list, function () { if (!busy) { read(); if (n) show(); } });
  read(); show();
  return { destroy: function () { clearInterval(timer); mo.disconnect(); C.unscene(ct, st); } };
} });
