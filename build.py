"""Build CRSL : génère dist/crsl/ (standalone, library, gabarit, demo, README) et dist/crsl-vX.Y.Z.zip.
Usage : python3 build.py
Pour ajouter un carrousel : créer src/mods/<cle>.js + .css, l'ajouter à CAROUSELS et à SECTIONS (démo)."""
import json, os, random, shutil, urllib.parse, uuid, zipfile
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = os.path.join(ROOT, "src"), os.path.join(ROOT, "dist", "crsl")
VERSION = "1.1.0"
CAROUSELS = [  # (clé, nom, famille, options)
  ("vague", "Vague diagonale", 1, "molette, auto"),
  ("coverflow", "Coverflow 3D", 1, "molette, auto"),
  ("equipe", "Slider d'équipe", 1, "molette, auto"),
  ("galerie", "Galerie inclinée", 1, "molette, auto"),
  ("anneau", "Anneau 3D", 1, "molette"),
  ("pile", "Pile de cartes", 1, "auto"),
  ("verre", "Carrousel en verre", 1, "molette, auto"),
  ("bandeau", "Bandeau infini", 1, "-"),
  ("accordeon", "Accordéon horizontal", 1, "-"),
  ("defilement", "Défilement horizontal au scroll", 1, "-"),
  ("liste", "Liste + aperçu", 1, "-"),
  ("carte", "Carte qui s'agrandit", 2, "auto"),
  ("rideau", "Transition en rideau", 2, "auto"),
  ("diagonale", "Écran en diagonale", 2, "auto"),
  ("produit", "Produit détouré", 2, "auto"),
]
def read(*p): return open(os.path.join(SRC, *p), encoding="utf-8").read()
def write(path, txt):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(txt)
shutil.rmtree(os.path.join(ROOT, "dist"), ignore_errors=True)
core_js, core_css = read("core.js"), read("core.css")
head = "/*! CRSL v%s – carrousels pour listes d'items inwink */\n" % VERSION
for k, name, fam, _ in CAROUSELS:
    f = os.path.join(OUT, "standalone", "crsl-" + k)
    write(os.path.join(f, "crsl-%s.js" % k), head + core_js + "\n" + read("mods", k + ".js"))
    write(os.path.join(f, "crsl-%s.css" % k), head + core_css + "\n" + read("mods", k + ".css"))
write(os.path.join(OUT, "library", "crsl.js"), head + core_js + "\n" + "\n".join(read("mods", k + ".js") for k, *_ in CAROUSELS))
write(os.path.join(OUT, "library", "crsl.css"), head + core_css + "\n" + "\n".join(read("mods", k + ".css") for k, *_ in CAROUSELS))

# ---------- Images de démo (paysages SVG) ----------
def scene(seed, sky, sun, layers, water=None):
    rnd = random.Random(seed)
    def ridge(base, amp, step):
        d = "M0 1000 L0 %d" % base
        for x in range(0, 1601, step): d += " L%d %d" % (x, base - rnd.random() * amp)
        return d + " L1600 1000 Z"
    body = "".join("<path d='%s' fill='%s'/>" % (ridge(b, a, s), c) for b, a, s, c in layers)
    if water: body += "<rect y='%d' width='1600' height='%d' fill='%s'/>" % (water[0], 1000 - water[0], water[1])
    svg = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 1000' preserveAspectRatio='xMidYMid slice'>"
           "<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='%s'/><stop offset='1' stop-color='%s'/></linearGradient></defs>"
           "<rect width='1600' height='1000' fill='url(#s)'/><circle cx='%d' cy='%d' r='70' fill='%s'/>%s</svg>") % (sky[0], sky[1], sun[0], sun[1], sun[2], body)
    return "data:image/svg+xml," + urllib.parse.quote(svg)
IMGS = [
    scene(3, ("#6f9fc9", "#e9d6b4"), (1200, 260, "#fff3d6"), [(520, 260, 90, "#7d8c97"), (640, 200, 120, "#4d5c52"), (780, 140, 80, "#2b3a2f"), (900, 60, 60, "#18231b")]),
    scene(11, ("#2c3e57", "#f0a86a"), (800, 560, "#ffd18a"), [(600, 90, 160, "#51405a"), (680, 50, 200, "#2f2a3a")], (700, "#3a4f63")),
    scene(21, ("#f2c7a5", "#f7e7d3"), (420, 300, "#f28b5b"), [(480, 300, 200, "#b8a6b5"), (620, 180, 110, "#7b6a7d"), (800, 90, 70, "#3f3444")]),
    scene(31, ("#8cc6e0", "#e8f1ec"), (1350, 200, "#fffbe8"), [(420, 220, 70, "#c9b89c"), (600, 160, 60, "#9c8a6c"), (760, 120, 50, "#5f7a54")], (850, "#2fa3a0")),
    scene(41, ("#1b2c4a", "#6f8fb8"), (300, 220, "#d9f2ff"), [(430, 380, 110, "#5a6f8e"), (600, 260, 90, "#35455f"), (760, 120, 70, "#1c2638")], (780, "#24374f")),
    scene(51, ("#e46a3d", "#f7c37a"), (1100, 380, "#fff0c2"), [(560, 160, 180, "#c2563a"), (700, 110, 140, "#8e3a2c"), (860, 60, 100, "#4e1f1c")]),
]

# ---------- Gabarit CRSL (contrat famille 2) ----------
def notempty(name):
    return [{"not": {"or": [{"name": name, "op": "isempty"}, {"name": name, "op": "eq", "val": ""}, {"name": name, "op": "eq", "val": None}]}}]
def sel(key, fr, en, opts):
    return {"key": key, "type": "selectlist", "isLocalizable": False, "labels": {"fr": fr, "en": en},
            "valuesList": [{"isSelectable": True, "key": k, "labels": {"fr": a, "en": b}} for k, a, b in opts]}
custom_css = """/* Gabarit CRSL – rendu en liste classique tant qu'aucune classe crsl- n'est appliquée au bloc.
   Contrat pour les carrousels : .crsl-f-picture, .crsl-f-title, .crsl-content (obligatoires), .crsl-f-color (facultatif). */
##contentid .crsl-f-color { display: none; }
##contentid .image-light .picture-wrapper:before { background-color: rgba(255, 255, 255, 0.3); }
##contentid .image-dark .picture-wrapper:before { background-color: rgba(0, 0, 0, 0.3); }
##contentid :is(.image-dark, .image-light) .picture-wrapper:before { content: ''; position: absolute; inset: 0; z-index: 1; }
##contentid .text-center :is(.header-container, .description) { text-align: center; }
##contentid .text-center a[role=button] { margin-left: auto; margin-right: auto; }
##contentid .text-right :is(.header-container, .description) { text-align: right; }
##contentid .text-right a[role=button] { margin-left: auto; }
##contentid .itemcontent { display: flex; flex-flow: column nowrap; gap: 20px; height: 100%; padding: 0; cursor: initial; user-select: initial; }
##contentid .picture-wrapper { display: flex; position: relative; }
##contentid .picture-wrapper .picture { width: 100%; height: max(28vh, 10rem); max-height: 220px; object-fit: cover; }
##contentid .image-cutout .picture-wrapper .picture { object-fit: contain; }
##contentid .itemcontent .content-wrapper { display: flex; flex-flow: column nowrap; align-items: flex-start; flex: 1; gap: 1rem; width: 100%; }
##contentid .itemcontent .content-wrapper .header-container { width: 100%; }
##contentid .itemcontent .content-wrapper :is(h3, h4, .description) { margin: 0; width: 100%; }
##contentid .card .content-wrapper { padding: 0 20px 20px 20px; }
##contentid .card :first-child.content-wrapper { padding: 20px; }
##contentid .card .content-wrapper * + a[role=button] { margin-top: auto; }
##contentid .inwink-item { container-type: inline-size; }"""
gab_colors = ["#e2663c", "#2f80c9", "#3fa46a", "#8a5cd6"]
gabarit = {
  "id": str(uuid.uuid4()), "type": "itemslist", "customCSS": custom_css,
  "properties": {
    "template": {
      "type": "article", "doNotApplyLink": True,
      "conditionalClasses": {
        "text-left": [{"name": "text-position", "op": "eq", "val": "left"}],
        "text-center": [{"name": "text-position", "op": "eq", "val": "center"}],
        "text-right": [{"name": "text-position", "op": "eq", "val": "right"}],
        "image-dark": [{"name": "image-opacity", "op": "eq", "val": "dark"}],
        "image-light": [{"name": "image-opacity", "op": "eq", "val": "light"}],
        "image-cutout": [{"name": "picture-cutout", "op": "eq", "val": True}],
        "card": [{"name": "card-display", "op": "eq", "val": True}]},
      "blocs": [
        {"type": "div", "className": "picture-wrapper crsl-f-picture", "showIf": notempty("picture"),
         "blocs": [{"type": "inwinkimage", "className": "picture", "properties": {
           "lazy": True, "target": "picture", "alt": ["title"], "sizes": "min(100cqw, 1280px)",
           "availableSizes": [600, 1000, 1600], "defaultSize": 1000}}]},
        {"type": "div", "className": "content-wrapper crsl-content", "blocs": [
          {"type": "header", "className": "header-container", "blocs": [
            {"type": "h4", "className": "bloc-accent", "showIf": notempty("pretitle"), "fields": [{"name": "pretitle"}]},
            {"type": "h3", "className": "title crsl-f-title", "showIf": notempty("title"), "fields": [{"name": "title"}]}]},
          {"type": "div", "className": "description", "showIf": notempty("description"), "fields": [{"name": "description"}]},
          {"type": "div", "className": "crsl-f-color", "showIf": notempty("color"), "fields": [{"name": "color"}]},
          {"type": "a", "role": "button", "className": "buttontitle",
           "showIf": notempty("$link") + notempty("buttontitle"), "fields": [{"name": "buttontitle"}], "useItemLink": True}]}]},
    "itemDefinition": {
      "fields": [
        {"key": "picture", "type": "picture", "isLocalizable": False, "labels": {"fr": "Photo", "en": "Picture"}},
        {"key": "picture-cutout", "type": "bool", "isLocalizable": False,
         "labels": {"fr": "Image détourée (PNG transparent)", "en": "Cut-out picture (transparent PNG)"},
         "descriptions": {"fr": "Utilisé par les carrousels Produit détouré et Écran en diagonale", "en": "Used by the Cut-out product and Diagonal screen carousels"}},
        {"key": "pretitle", "type": "Text", "isLocalizable": True, "labels": {"fr": "Pré-titre", "en": "Pretitle"}},
        {"key": "title", "type": "Text", "isLocalizable": True, "labels": {"fr": "Titre", "en": "Title"}},
        {"key": "description", "type": "multilinetext", "isLocalizable": True, "labels": {"fr": "Description", "en": "Description"}},
        {"key": "buttontitle", "type": "text", "isLocalizable": True, "labels": {"fr": "Titre bouton", "en": "Button title"}},
        {"key": "color", "type": "text", "isLocalizable": False, "labels": {"fr": "Couleur (carrousel)", "en": "Color (carousel)"},
         "descriptions": {"fr": "Hexa, rgb(), rgba() ou hsl(). Ex. : #2f80c9", "en": "Hex, rgb(), rgba() or hsl(). E.g. #2f80c9"}},
        {"key": "card-display", "type": "bool", "isLocalizable": False, "labels": {"fr": "Affichage de la carte", "en": "Display as a card"}},
        sel("image-opacity", "Opacité de l'image", "Image opacity", [("light", "Clair", "Light"), ("dark", "Sombre", "Dark"), ("normal", "Aucune", "None")]),
        sel("text-position", "Position du texte", "Text position", [("left", "Gauche", "Left"), ("center", "Centre", "Center"), ("right", "Droite", "Right")])],
      "languages": ["fr", "en"]},
    "items": [{
      "id": str(uuid.uuid4()),
      "picture": "https://cdn-assets.inwink.com/backoffice-public/assets/pictures/00-inwink/Background_Blue.jpg",
      "picture-cutout": False,
      "pretitle": {"fr": "Pré-titre %d" % (i + 1), "en": "Pretitle %d" % (i + 1)},
      "title": {"fr": "Titre %d" % (i + 1), "en": "Title %d" % (i + 1)},
      "description": {"fr": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "en": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."},
      "buttontitle": {"fr": "En savoir plus", "en": "Learn more"}, "$link": {"target": "home"},
      "color": gab_colors[i], "card-display": True, "image-opacity": "normal", "text-position": "left"} for i in range(4)],
    "itemsLayout": {"L": "col4", "M": "col3", "S": "col2", "XS": "col2", "XXS": "col1"},
    "itemsAlign": {"default": "center"}},
  "layout": None, "header": None}
write(os.path.join(OUT, "gabarit", "gabarit-crsl.json"), json.dumps(gabarit, ensure_ascii=False, indent=2))

# ---------- Démo locale ----------
def svg_uri(svg): return "data:image/svg+xml," + urllib.parse.quote(svg)
def bottle(c0, c1):
    return svg_uri("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 170 360'><rect x='62' y='0' width='46' height='30' rx='6' fill='#fff'/>"
      "<path d='M66 30h38v30c0 20 46 40 46 80v190a30 30 0 0 1-30 30H50a30 30 0 0 1-30-30V140c0-40 46-60 46-80z' fill='%s'/>"
      "<rect x='20' y='170' width='130' height='110' fill='#fff' opacity='.92'/><circle cx='85' cy='225' r='30' fill='%s'/></svg>" % (c1, c0))
def figure(c0, pose):
    P = [[[88,100,55,160,70,215],[135,100,175,70,190,30]],[[88,100,50,130,30,90],[135,100,165,150,150,210]],[[88,100,40,110,15,120],[135,100,185,110,210,100]]][pose % 3]
    pl = lambda a: "<polyline points='%s'/>" % " ".join(map(str, a))
    return svg_uri("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 230 400'><path d='M95 95 Q60 250 40 330 L150 300 Q140 200 128 95' fill='%s'/>"
      "<g fill='none' stroke='#1f2328' stroke-linecap='round' stroke-linejoin='round'><g stroke-width='26'>%s%s<polyline points='100 205 80 300 70 385'/><polyline points='125 205 150 295 165 382'/></g>"
      "<line x1='111' y1='92' x2='112' y2='200' stroke-width='58'/></g><circle cx='112' cy='52' r='28' fill='#1f2328'/><path d='M86 50h52v10H86z' fill='#fff' opacity='.85'/></svg>" % (c0, pl(P[0]), pl(P[1])))
PAL = [("#e2663c", "#7a1f3d"), ("#2f80c9", "#132f5c"), ("#3fa46a", "#0f3b36"), ("#d4a72c", "#6b3b12"), ("#8a5cd6", "#2a1753"), ("#e0507b", "#4a1330")]
LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
fv = lambda t: '<span class="fieldval"><span class="fieldtext">%s</span></span>' % t
LIST_CLS = "inwink-items teaser-list legacyflex layout-XXS-col1 layout-XS-col2 layout-S-col2 layout-M-col3 layout-L-col4 bloc-content layout-col4"
def img_for(i): return IMGS[i % len(IMGS)]
def item_default(i):
    return ('<div class="inwink-item " id="item-d%d"><article class="itemcontent clickable text-left card">'
      '<div class="picture-wrapper picture-wrapper"><img class="picture " loading="lazy" src="%s" alt=""></div>'
      '<div class="content-wrapper content-wrapper"><header class="header-container header-container"><h4 class="bloc-accent bloc-accent">%s</h4>'
      '<h3 class="title title">%s</h3></header><div class="description description">%s</div>'
      '<a class="buttontitle buttontitle link-inwink" role="button" href="#item-%d">%s</a></div></article></div>') % (
      i, img_for(i), fv("Pré-titre %d" % (i + 1)), fv("Titre %d" % (i + 1)), fv(LOREM), i + 1, fv("En savoir plus"))
def item_overlay(i):
    return ('<div class="inwink-item " id="item-"><a class="itemcontent clickable text-left link-inwink" href="#overlay-%d">'
      '<div class="picture-wrapper picture-wrapper"><img class="picture " loading="lazy" src="%s" alt=""></div>'
      '<div class="overlay overlay"><h3 class="title title">%s</h3><div class="description description">%s</div></div></a></div>') % (
      i, img_for(i), fv("Titre %d" % (i + 1)), fv(LOREM))
def item_crsl(i, src=None, cutout=False, color=True):
    return ('<div class="inwink-item " id="item-c%d"><article class="itemcontent clickable text-left card%s">'
      '<div class="picture-wrapper crsl-f-picture"><img class="picture " loading="lazy" src="%s" alt=""></div>'
      '<div class="content-wrapper crsl-content"><header class="header-container"><h4 class="bloc-accent">%s</h4>'
      '<h3 class="title crsl-f-title">%s</h3></header><div class="description">%s</div>%s'
      '<a class="buttontitle link-inwink" role="button" href="#crsl-%d">%s</a></div></article></div>') % (
      i, " image-cutout" if cutout else "", src or img_for(i), fv("Pré-titre %d" % (i + 1)), fv("Titre %d" % (i + 1)), fv(LOREM),
      ('<div class="crsl-f-color">%s</div>' % PAL[i % 6][0]) if color else "", i + 1, fv("En savoir plus"))
def bloc(cid, classes, html):
    return ('<div id="%s" class="itemslist dynamicbloc-contentwrapper bloc-itemslist %s"><div class="dynamiccontentbloc">'
            '<div class="%s">%s</div></div><div class="iw-clearfix"></div></div>') % (cid, classes, LIST_CLS, html)
SECTIONS = [
  ("vague", "crsl-vague", "défaut", "".join(item_default(i) for i in range(6))),
  ("coverflow", "crsl-coverflow", "défaut", "".join(item_default(i) for i in range(6))),
  ("equipe", "crsl-equipe", "défaut", "".join(item_default(i) for i in range(6))),
  ("galerie", "crsl-galerie", "overlay", "".join(item_overlay(i) for i in range(6))),
  ("anneau", "crsl-anneau", "overlay", "".join(item_overlay(i) for i in range(8))),
  ("pile", "crsl-pile", "défaut", "".join(item_default(i) for i in range(5))),
  ("verre", "crsl-verre", "défaut", "".join(item_default(i) for i in range(6))),
  ("bandeau", "crsl-bandeau", "overlay", "".join(item_overlay(i) for i in range(9))),
  ("accordeon", "crsl-accordeon", "défaut", "".join(item_default(i) for i in range(5))),
  ("defilement", "crsl-defilement", "défaut", "".join(item_default(i) for i in range(7))),
  ("liste", "crsl-liste", "défaut", "".join(item_default(i) for i in range(5))),
  ("carte", "crsl-carte", "CRSL", "".join(item_crsl(i) for i in range(6))),
  ("rideau", "crsl-rideau", "CRSL", "".join(item_crsl(i) for i in range(5))),
  ("diagonale", "crsl-diagonale", "CRSL (détouré + photos)", "".join(item_crsl(i, figure(PAL[i][0], i), True) if i % 2 == 0 else item_crsl(i) for i in range(5))),
  ("produit", "crsl-produit", "CRSL (détouré)", "".join(item_crsl(i, bottle(*PAL[i]), True) for i in range(5))),
]
names = {k: (nm, fam) for k, nm, fam, _ in CAROUSELS}
sections_html = ""
for key, cls, gab, html in SECTIONS:
    nm, fam = names[key]
    sections_html += ('<section><h2>%s</h2><p class="hint">Classe <code>%s</code> · famille %d · gabarit %s</p>'
      '<button class="toggle" data-target="ct-%s" data-cls="%s">Retirer la classe</button>%s</section>\n') % (
      nm, cls, fam, gab, key, cls, bloc("ct-" + key, cls, html))
demo = """<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>CRSL – démo locale</title>
<link rel="stylesheet" href="../library/crsl.css">
<style>
/* Imitation minimale des styles inwink (démo uniquement) */
:root { --inwinkaccentcolor: #e8542b; }
body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f4f4f1; color: #1d2320; }
main { max-width: 1200px; margin: 0 auto; padding: 2rem 1.2rem 6rem; }
section { margin-bottom: 5rem; } h2 { margin: 0 0 .3rem; } .hint { color: #5d646b; margin: 0 0 .8rem; }
.toggle { font: inherit; margin-bottom: 1rem; padding: .4rem .8rem; border-radius: 6px; border: 1px solid #bbb; background: #fff; cursor: pointer; }
.inwink-items.legacyflex { display: flex; flex-wrap: wrap; gap: 16px; }
.layout-col4 > .inwink-item { width: calc(25% - 12px); }
.inwink-item { box-sizing: border-box; }
.itemcontent { display: flex; flex-direction: column; gap: 16px; height: 100%; color: inherit; text-decoration: none; }
.card { background: #fff; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
.picture-wrapper { display: flex; } .picture-wrapper .picture { width: 100%; height: 180px; object-fit: cover; }
.image-cutout .picture-wrapper .picture { object-fit: contain; }
.content-wrapper { display: flex; flex-direction: column; gap: .7rem; padding: 0 18px 18px; flex: 1; align-items: flex-start; }
.content-wrapper h3, .content-wrapper h4, .description { margin: 0; }
.bloc-accent { font-size: .85rem; } .description { font-size: .9rem; line-height: 1.45; }
.crsl-f-color { display: none; }
a[role=button] { margin-top: auto; background: var(--inwinkaccentcolor); color: #fff; padding: .45rem .9rem; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: .8rem; }
a.itemcontent:has(.overlay) { display: grid; grid-template-areas: "stack"; border-radius: 6px; overflow: hidden; }
a.itemcontent:has(.overlay) > * { grid-area: stack; }
a.itemcontent .picture { height: 300px; }
.overlay { display: flex; flex-direction: column; justify-content: flex-end; padding: 18px; z-index: 1; color: #fff; background: linear-gradient(0deg, rgba(0,0,0,.75), rgba(0,0,0,0) 70%); }
.overlay h3 { margin: 0 0 .4rem; } .overlay .description { font-size: .85rem; }
</style></head><body><main>
<h1>CRSL – démo locale</h1>
<p class="hint">Chaque bloc reproduit le DOM d'une liste d'items inwink statique. Le bouton ajoute ou retire la classe du carrousel sur le conteneur, comme dans le back-office.</p>
{SECTIONS}
</main>
<script src="../library/crsl.js"></script>
<script>
document.querySelectorAll(".toggle").forEach(function (b) {
  b.onclick = function () {
    var on = document.getElementById(b.dataset.target).classList.toggle(b.dataset.cls);
    b.textContent = on ? "Retirer la classe" : "Ajouter la classe";
  };
});
</script></body></html>""".replace("{SECTIONS}", sections_html)
write(os.path.join(OUT, "demo", "index.html"), demo)

# ---------- README ----------
rows = "\n".join("| `crsl-%s` | %s | %d | %s |" % (k, nm, fam, op) for k, nm, fam, op in CAROUSELS)
readme = """# CRSL – carrousels pour les listes d'items inwink (v{V})

## Contenu
- `standalone/crsl-<nom>/` : un CSS + un JS par carrousel (noyau inclus).
- `library/crsl.css` + `library/crsl.js` : tous les carrousels, pour les styles et scripts globaux du site.
- `gabarit/gabarit-crsl.json` : gabarit de liste d'items statiques pour la famille 2.
- `demo/index.html` : démo locale de tous les carrousels (double-clic pour l'ouvrir).

Les deux méthodes peuvent coexister sur une même page : le noyau ne se charge qu'une fois.

## Utilisation
1. Ajouter le CSS et le JS (standalone ou bibliothèque).
2. Mettre la liste d'items en mode d'affichage **Liste** (pas Carrousel).
3. Ajouter la classe du carrousel au bloc (et éventuellement des options).

Le nombre max d'éléments du bloc est respecté. Le réglage des colonnes n'a plus d'effet sur un bloc transformé.

## Carrousels
| Classe | Nom | Famille | Options |
|---|---|---|---|
{ROWS}

**Famille 1** : anime les items d'origine sur place. Fonctionne avec tous les gabarits, statiques comme dynamiques
(speakers, sessions, partenaires) ; le rendu du gabarit et les boutons inwink sont conservés.

**Famille 2** : compose une scène à partir des champs de chaque item. Réservée aux listes statiques, gabarit CRSL recommandé.

## Contrat du gabarit (famille 2)
| Classe | Rôle | |
|---|---|---|
| `crsl-f-picture` | conteneur de l'image principale | obligatoire |
| `crsl-f-title` | titre (animé dans la scène, repris dans les vignettes) | obligatoire |
| `crsl-content` | tout le contenu affiché dans la scène (hors image) | obligatoire |
| `crsl-f-color` | couleur de l'item (hexa, rgb, rgba, hsl) | facultatif |
| `image-cutout` | classe conditionnelle sur l'`article` : image détourée | facultatif |

Tout ce que vous ajoutez dans `crsl-content` (texte, tag, lien, bouton…) apparaît dans la scène.
Les liens et boutons recopiés déclenchent ceux d'origine (navigation interne inwink conservée).
Les classes peuvent être combinées avec d'autres, et les clés des champs renommées librement.

## Options (classes à ajouter en plus sur le bloc)
- `crsl-opt-molette` : la molette fait défiler le carrousel quand la souris est dessus.
- `crsl-opt-auto` : défilement automatique, en pause au survol.

## Variables CSS (à définir sur le bloc)
- `--crsl-card-w` : largeur des cartes (famille 1).
- `--crsl-h` : hauteur de la scène ou du carrousel.
- `--crsl-accent` : couleur d'accent (par défaut : couleur de l'item, sinon `--inwinkaccentcolor`).
- `--crsl-radius` : arrondi des scènes.
- `--crsl-bg` : fond de la galerie inclinée / du carrousel en verre.
- `--crsl-diag-bg`, `--crsl-diag-ink` : fond et texte de l'écran en diagonale.

## Points d'attention
- **Défilement au scroll** : un parent en `overflow: hidden` ou `auto` empêche l'épinglage du bloc.
- **Bandeau infini** : prévoir assez d'items pour couvrir la largeur du bloc.
- **Accessibilité** : les animations sont réduites si le visiteur a activé « réduire les animations ».

## Hébergement externe (option)
Déposer `library/` dans un dépôt GitHub, puis charger
`https://cdn.jsdelivr.net/gh/<compte>/<depot>@v{V}/library/crsl.js` (idem pour le CSS).
Le numéro de version dans l'URL évite les problèmes de cache lors des mises à jour.
""".replace("{V}", VERSION).replace("{ROWS}", rows)
write(os.path.join(OUT, "README.md"), readme)

zpath = os.path.join(ROOT, "dist", "crsl-v%s.zip" % VERSION)
with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
    for base, _, files in os.walk(OUT):
        for f in files:
            full = os.path.join(base, f)
            z.write(full, os.path.join("crsl", os.path.relpath(full, OUT)))
print("ok", zpath)
