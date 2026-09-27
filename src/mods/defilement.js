/* Défilement horizontal au scroll (famille 1) – classe crsl-defilement
   Le bloc reste épinglé et les items défilent latéralement pendant le scroll vertical de la page.
   Sur un vrai site inwink, la page ne scrolle pas via window : le scroll se fait dans le
   <div class="dynamicpage-scrollcontent"> (overflow: hidden auto), présent sur toutes les pages
   inwink. On écoute donc cet ancêtre s'il existe, sinon window (démo, page standalone). */
CRSL.register("defilement", { init: function (ct, list, C) {
  var box = list.parentNode, queued = false;
  var scroller = (ct.closest && ct.closest(".dynamicpage-scrollcontent")) || window;
  function viewportHeight() { return scroller === window ? window.innerHeight : scroller.clientHeight; }
  function update() {
    queued = false;
    var dist = Math.max(0, list.scrollWidth - list.clientWidth);
    var vh = viewportHeight();
    box.style.height = (vh + dist) + "px";
    list.style.height = vh + "px";
    var r = box.getBoundingClientRect(), max = box.offsetHeight - vh;
    var pr = max > 0 ? Math.min(1, Math.max(0, -r.top / max)) : 0;
    list.style.setProperty("--crsl-x", (-pr * dist) + "px");
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  scroller.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  var ro = window.ResizeObserver ? new ResizeObserver(schedule) : null;
  if (ro) ro.observe(list);
  var mo = new MutationObserver(schedule);
  mo.observe(list, { childList: true });
  list.addEventListener("load", schedule, true);
  update();
  return { destroy: function () {
    scroller.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
    if (ro) ro.disconnect(); mo.disconnect();
    box.style.height = ""; list.style.height = ""; list.style.removeProperty("--crsl-x");
  } };
} });
