/* Défilement horizontal au scroll (famille 1) – classe crsl-defilement
   Le bloc reste épinglé et les items défilent latéralement pendant le scroll vertical de la page. */
CRSL.register("defilement", { init: function (ct, list, C) {
  var box = list.parentNode, queued = false;
  function update() {
    queued = false;
    var dist = Math.max(0, list.scrollWidth - list.clientWidth);
    box.style.height = (window.innerHeight + dist) + "px";
    var r = box.getBoundingClientRect(), max = box.offsetHeight - window.innerHeight;
    var pr = max > 0 ? Math.min(1, Math.max(0, -r.top / max)) : 0;
    list.style.setProperty("--crsl-x", (-pr * dist) + "px");
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  var ro = window.ResizeObserver ? new ResizeObserver(schedule) : null;
  if (ro) ro.observe(list);
  var mo = new MutationObserver(schedule);
  mo.observe(list, { childList: true });
  list.addEventListener("load", schedule, true);
  update();
  return { destroy: function () {
    window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
    if (ro) ro.disconnect(); mo.disconnect();
    box.style.height = ""; list.style.removeProperty("--crsl-x");
  } };
} });
