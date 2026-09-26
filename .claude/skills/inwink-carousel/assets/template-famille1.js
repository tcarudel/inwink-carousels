/* <Nom lisible> (famille 1) – classe crsl-<cle> – options : crsl-opt-molette, crsl-opt-auto
   Inspiration : <lien>
   Les items inwink d'origine sont animés sur place : ne jamais modifier leur className ni les déplacer. */
CRSL.register("<cle>", { init: function (ct, list, C) {
  return C.track(ct, list, {
    pad: 120,                                   // marge verticale de la scène
    dragFactor: 0.62,                           // sensibilité du glisser
    loop: function (n) { return n >= 5; },      // boucle infinie à partir de 5 items
    render: function (e, x, W, set) {
      // x : 0 = item actif, -1 = précédent, 1 = suivant (valeurs décimales pendant l'animation)
      var ab = Math.abs(x);
      set(e,
        "translateX(" + x * W * 0.7 + "px) scale(" + (1 - Math.min(ab, 1) * 0.15) + ")", // transform
        C.clamp01(3 - ab),                                                            // opacité (fondu au-delà de 2)
        100 - ab * 10,                                                                // z-index
        "brightness(" + (1 - Math.min(ab, 1) * 0.2) + ")");                          // filter (facultatif)
    }
  });
} });
