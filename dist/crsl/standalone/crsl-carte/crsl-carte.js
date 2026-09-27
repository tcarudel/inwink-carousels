/*! CRSL v1.3.1 – carrousels pour listes d'items inwink */
/* CRSL – noyau commun */
(function (w, d) {
  if (w.CRSL) return; // déjà chargé (bibliothèque + standalone sur la même page)

  var P = "crsl-";
  var registry = {};
  var instances = new Map();
  var warned = new WeakSet();
  var queued = false;
  var reduce = w.matchMedia && w.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var en = /^en/i.test(d.documentElement.lang || "");
  var L = en ? { prev: "Previous", next: "Next", show: "Show" } : { prev: "Précédent", next: "Suivant", show: "Afficher" };

  /* ---------- Utilitaires ---------- */
  function largestSrc(img) {
    if (!img) return null;
    var set = img.getAttribute("srcset"), best = img.getAttribute("src"), bestW = 0;
    if (set) set.split(",").forEach(function (part) {
      var bits = part.trim().split(/\s+/), wv = parseInt(bits[1], 10) || 0;
      if (bits[0] && wv >= bestW) { bestW = wv; best = bits[0]; }
    });
    return best;
  }
  function text(root, sels) {
    for (var i = 0; i < sels.length; i++) {
      var e = root.querySelector(sels[i]);
      if (e && e.textContent.trim()) return e.textContent.trim();
    }
    return "";
  }
  function validColor(c) { return c && w.CSS && w.CSS.supports && w.CSS.supports("color", c) ? c : ""; }
  function items(list) { return [].slice.call(list.children).filter(function (e) { return e.classList.contains("inwink-item"); }); }
  function el(tag, cls, html) { var e = d.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function cssUrl(s) { return s ? 'url("' + String(s).replace(/"/g, "%22") + '")' : "none"; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function opt(ct, name) { return ct.classList.contains(P + "opt-" + name); }
  function mod(v, n) { return ((v % n) + n) % n; }

  var ARROW = function (dir) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="' +
      (dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7") + '"/></svg>';
  };
  function nav(parent, go) {
    var n = el("div", P + "nav");
    [-1, 1].forEach(function (dir) {
      var b = el("button", P + "arrow", ARROW(dir));
      b.type = "button";
      b.setAttribute("aria-label", dir < 0 ? L.prev : L.next);
      b.addEventListener("click", function () { go(dir); });
      n.appendChild(b);
    });
    parent.appendChild(n);
    return n;
  }

  /* ---------- Famille 2 : lecture des champs ----------
     Contrat : .crsl-f-picture (image), .crsl-f-title (titre), .crsl-content (contenu affiché), .crsl-f-color (facultatif)
     Replis pour les gabarits inwink standards : .picture-wrapper / .title / .content-wrapper / .overlay */
  function fields(item) {
    var q = function (s) { return item.querySelector(s); };
    var crsl = !!q(".crsl-content");
    var ic = q(".itemcontent") || item;
    var col = q(".crsl-f-color");
    return {
      item: item,
      img: largestSrc(q(".crsl-f-picture img") || (crsl ? null : (q(".picture-wrapper img") || q("img")))),
      title: text(item, [".crsl-f-title", ".title", "h3"]),
      content: q(".crsl-content") || q(".content-wrapper") || q(".overlay"),
      color: validColor(col ? col.textContent.trim() : ""),
      cutout: ic.classList.contains("image-cutout"),
      link: ic.tagName === "A" ? ic : null
    };
  }

  // Recopie le contenu d'un item dans la scène ; les liens et boutons recopiés déclenchent ceux d'origine
  function mount(box, f, animate) {
    box.textContent = "";
    box._f = f;
    var titleEl;
    if (f.content) {
      var c = f.content.cloneNode(true);
      c.removeAttribute("id");
      c.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
      c.querySelectorAll("img[loading]").forEach(function (e) { e.loading = "eager"; });
      box.appendChild(c);
      titleEl = c.querySelector(".crsl-f-title") || c.querySelector(".title");
    } else {
      titleEl = el("h3", "crsl-f-title");
      box.appendChild(titleEl);
    }
    if (titleEl) {
      var words = (titleEl.textContent || f.title).trim().split(/\s+/);
      titleEl.textContent = "";
      words.forEach(function (wd, i) {
        if (i) titleEl.appendChild(d.createTextNode(" "));
        var o = el("span", P + "w"), s = el("span"); s.textContent = wd; o.appendChild(s); titleEl.appendChild(o);
      });
    }
    if (!box._wired) {
      box._wired = true;
      box.addEventListener("click", function (e) {
        var a = e.target.closest("a, button"), f2 = box._f;
        if (!a || !box.contains(a) || !f2 || !f2.content) return;
        if (a.tagName === "A" && (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0)) return;
        var clones = [].slice.call(box.firstElementChild.querySelectorAll("a, button"));
        var orig = f2.content.querySelectorAll("a, button")[clones.indexOf(a)];
        if (orig) { e.preventDefault(); orig.click(); }
      });
    }
    (w.requestAnimationFrame || setTimeout)(function () {
      box.classList.toggle(P + "over", box.scrollHeight > box.clientHeight + 2);
    });
    if (!animate || reduce) return;
    box.querySelectorAll("." + P + "w > span").forEach(function (s, i) {
      s.animate([{ transform: "translateY(110%)" }, { transform: "none" }],
        { duration: 700, delay: i * 70, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
    });
    box.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
      { duration: 600, delay: 120, easing: "ease-out", fill: "backwards" });
  }

  /* ---------- Famille 1 : moteur commun des carrousels « sur place » ----------
     Les items d'origine sont positionnés en absolu et transformés via des variables CSS. */
  function track(ct, list, o) {
    var it = [], n = 0, loop = false, p = 0, target = 0, raf = 0, drag = null, moved = false;
    var timer = 0, wheelT = 0, hover = false, off = [];
    function on(t, ev, fn, op) { t.addEventListener(ev, fn, op); off.push(function () { t.removeEventListener(ev, fn, op); }); }
    function clamp(v) { return loop ? v : Math.max(0, Math.min(n - 1, v)); }
    function iw() { return it[0] ? it[0].offsetWidth : 260; }
    function activeIndex() { return n ? mod(Math.round(target), n) : 0; }
    function rel(i) {
      var x = i - p;
      if (o.rel) return o.rel(x, n, loop);
      if (loop) { x = mod(x, n); if (x > n / 2) x -= n; }
      return x;
    }
    function measure() {
      var h = 0;
      it.forEach(function (e) { h = Math.max(h, e.offsetHeight); });
      list.style.setProperty("--crsl-h", (h + (o.pad == null ? 170 : o.pad)) + "px");
    }
    function set(e, t, op, z, f) {
      e.style.setProperty("--crsl-t", t);
      e.style.setProperty("--crsl-o", op);
      e.style.setProperty("--crsl-z", Math.round(z));
      e.style.setProperty("--crsl-f", f || "none");
    }
    function render() {
      var W = iw();
      it.forEach(function (e, i) {
        var x = rel(i);
        o.render(e, x, W, set, i, n);
        e.setAttribute("data-crsl-active", Math.abs(x) < 0.5 ? "1" : "0");
      });
      if (o.after) o.after(activeIndex(), it);
    }
    function drifting() { return o.drift && !C.reduce && !drag && !hover; }
    function tick() {
      if (drifting()) target += o.drift;
      p += (target - p) * (C.reduce ? 1 : 0.12);
      if (!o.drift && Math.abs(target - p) < 0.001) { p = target; render(); raf = 0; return; }
      render();
      raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function go(dir) { target = clamp(Math.round(target) + dir); kick(); }
    function goTo(i) {
      if (!loop) { target = i; kick(); return; }
      var diff = i - activeIndex();
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      target = Math.round(target) + diff; kick();
    }
    function collect() {
      it = items(list); n = it.length;
      loop = typeof o.loop === "function" ? o.loop(n) : !!o.loop;
      target = clamp(Math.round(target)); p = target;
      if (o.init) it.forEach(o.init);
      measure(); render();
      if (o.drift) kick();
    }
    var factor = function () { return iw() * (o.dragFactor || 0.62); };
    on(list, "pointerdown", function (e) { if (e.button === 0) { drag = { x: e.clientX, t: target, id: e.pointerId }; moved = false; } });
    on(list, "pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) > 6) { moved = true; try { list.setPointerCapture(drag.id); } catch (err) {} }
      if (moved) {
        target = drag.t - dx / factor();
        if (!loop) target = Math.max(-0.3, Math.min(n - 0.7, target));
        kick();
      }
    });
    function end() { if (!drag) return; drag = null; if (o.snap !== false) target = clamp(Math.round(target)); kick(); }
    on(list, "pointerup", end);
    on(list, "pointercancel", end);
    on(list, "dragstart", function (e) { e.preventDefault(); });
    on(list, "click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      if (o.clickCenter === false) return;
      var e2 = e.target.closest(".inwink-item");
      if (!e2 || e2.parentNode !== list) return;
      var i = it.indexOf(e2);
      if (i > -1 && i !== activeIndex()) { e.preventDefault(); e.stopPropagation(); goTo(i); }
    }, true);
    on(ct, "keydown", function (e) {
      if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
    });
    on(ct, "pointerenter", function () { hover = true; });
    on(ct, "pointerleave", function () { hover = false; if (o.drift) kick(); });
    if (opt(ct, "molette")) on(list, "wheel", function (e) {
      e.preventDefault();
      target += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 0.004;
      if (!loop) target = Math.max(-0.3, Math.min(n - 0.7, target));
      kick();
      clearTimeout(wheelT);
      wheelT = setTimeout(function () { if (o.snap !== false) target = clamp(Math.round(target)); kick(); }, 140);
    }, { passive: false });
    if (opt(ct, "auto") && !C.reduce && !o.drift) {
      timer = setInterval(function () {
        if (!hover && !drag && !ct.contains(d.activeElement)) {
          if (!loop && Math.round(target) >= n - 1) { target = 0; kick(); } else go(1);
        }
      }, 4000);
    }
    var navEl = o.nav === false ? null : nav(ct, go);
    ct.setAttribute("data-crsl-stage", "");
    var mo = new MutationObserver(collect);
    mo.observe(list, { childList: true });
    var ro = w.ResizeObserver ? new ResizeObserver(function () { measure(); render(); }) : null;
    if (ro) ro.observe(list);
    on(list, "load", measure, true);
    collect();
    return {
      destroy: function () {
        cancelAnimationFrame(raf); clearInterval(timer); clearTimeout(wheelT);
        off.forEach(function (f) { f(); });
        mo.disconnect(); if (ro) ro.disconnect();
        if (navEl) navEl.remove();
        ct.removeAttribute("data-crsl-stage");
        list.style.removeProperty("--crsl-h");
        if (o.destroy) o.destroy();
        it.forEach(function (e) {
          ["--crsl-t", "--crsl-o", "--crsl-z", "--crsl-f"].forEach(function (v) { e.style.removeProperty(v); });
          e.removeAttribute("data-crsl-active"); e.removeAttribute("data-crsl-n");
        });
      }
    };
  }


  /* ---------- Famille 2 : scène (la liste d'origine est masquée, la scène est ajoutée au bloc) ---------- */
  function scene(ct, cls) {
    var st = el("div", "crsl-x-stage " + cls);
    st.setAttribute("role", "region");
    st.setAttribute("aria-roledescription", "carousel");
    st.tabIndex = -1;
    ct.appendChild(st);
    ct.setAttribute("data-crsl-scene", "");
    return st;
  }
  function unscene(ct, st) { st.remove(); ct.removeAttribute("data-crsl-scene"); }
  // Balayage tactile / souris sur une scène : fn(+1 | -1)
  function swipe(elm, fn) {
    var sx = null, sy = 0;
    elm.addEventListener("pointerdown", function (e) { if (e.button === 0 && !e.target.closest("a, button")) { sx = e.clientX; sy = e.clientY; } });
    elm.addEventListener("pointerup", function (e) {
      if (sx == null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) fn(dx < 0 ? 1 : -1);
    });
  }
  function keys(elm, fn) {
    elm.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") fn(1);
      if (e.key === "ArrowLeft") fn(-1);
    });
  }
  // Défilement automatique d'une scène (option crsl-opt-auto)
  function autoplay(ct, elm, fn, ms) {
    if (!opt(ct, "auto") || reduce) return 0;
    var hover = false;
    elm.addEventListener("pointerenter", function () { hover = true; });
    elm.addEventListener("pointerleave", function () { hover = false; });
    return setInterval(function () { if (!hover && !elm.contains(d.activeElement)) fn(1); }, ms || 6000);
  }
  function watch(list, fn) {
    var mo = new MutationObserver(fn);
    mo.observe(list, { childList: true, subtree: true, characterData: true });
    return mo;
  }

  /* ---------- Détection des blocs ---------- */
  function scan() {
    queued = false;
    instances.forEach(function (inst, ct) {
      if (!ct.isConnected || !inst.list.isConnected || !ct.classList.contains(P + inst.name) ||
          ct.querySelector(".inwink-items") !== inst.list) {
        try { inst.destroy && inst.destroy(); } catch (e) {}
        ct.removeAttribute("data-crsl");
        instances.delete(ct);
      }
    });
    Object.keys(registry).forEach(function (name) {
      d.querySelectorAll("." + P + name).forEach(function (ct) {
        if (instances.has(ct) || ct.hasAttribute("data-crsl")) return;
        if (ct.querySelector(".slick-slider")) {
          if (!warned.has(ct)) { warned.add(ct); console.warn("[CRSL] Le bloc " + ct.id + " est en mode Carrousel inwink : passez-le en mode Liste pour utiliser ." + P + name); }
          return;
        }
        var list = ct.querySelector(".inwink-items");
        if (!list || !items(list).length) return;
        ct.setAttribute("data-crsl", name);
        var inst = null;
        try { inst = registry[name].init(ct, list, C); } catch (e) { console.error("[CRSL]", name, e); }
        if (!inst) { ct.removeAttribute("data-crsl"); return; }
        inst.name = name; inst.list = list;
        instances.set(ct, inst);
      });
    });
  }
  function schedule() { if (!queued) { queued = true; (w.requestAnimationFrame || setTimeout)(scan); } }

  var C = w.CRSL = {
    version: "1.1.0", reduce: reduce, L: L,
    register: function (name, m) { if (!registry[name]) { registry[name] = m; schedule(); } },
    items: items, fields: fields, mount: mount, track: track, nav: nav, el: el, opt: opt,
    scene: scene, unscene: unscene, swipe: swipe, keys: keys, autoplay: autoplay, watch: watch,
    cssUrl: cssUrl, clamp01: clamp01, mod: mod, largestSrc: largestSrc, validColor: validColor
  };

  function start() {
    scan();
    new MutationObserver(schedule).observe(d.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start); else start();
})(window, document);

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
