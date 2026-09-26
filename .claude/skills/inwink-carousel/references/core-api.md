# API du noyau CRSL (`window.CRSL`, noté `C`)

Source de vérité : `src/core.js`. Relis-le si ce document semble décalé.

## Enregistrement

```js
CRSL.register("<cle>", { init: function (ct, list, C) { /* … */ return { destroy: function () {} }; } });
```

- `ct` : conteneur du bloc (`#ct-…`), porteur de la classe `crsl-<cle>` et de `data-crsl="<cle>"`.
- `list` : l'élément `.inwink-items`.
- `init` peut retourner `null` pour renoncer (le noyau retire alors `data-crsl`).
- Un même nom n'est enregistré qu'une fois (bibliothèque + standalone sur la même page : pas de conflit).

## Utilitaires

| Fonction | Rôle |
|---|---|
| `C.items(list)` | tableau des `.inwink-item` enfants directs |
| `C.opt(ct, "molette")` | vrai si le bloc a la classe `crsl-opt-molette` |
| `C.nav(parent, go)` | ajoute deux flèches (`go(-1)` / `go(1)`) à la fin de `parent`, retourne l'élément |
| `C.el(tag, cls, html)` | crée un élément |
| `C.cssUrl(src)` | `url("…")` sûr pour `background-image` |
| `C.largestSrc(img)` | plus grande image d'un `srcset` (sinon `src`) |
| `C.validColor(str)` | la couleur si `CSS.supports`, sinon `""` |
| `C.clamp01(v)`, `C.mod(v, n)` | bornage 0–1, modulo positif |
| `C.reduce` | vrai si « réduire les animations » est actif |
| `C.L` | libellés FR/EN (`prev`, `next`, `show`) selon `lang` du document |

## Famille 1 : `C.track(ct, list, options)`

Retourne l'objet instance (`destroy` inclus) : il suffit de `return C.track(…)` dans `init`.

| Option | Défaut | Rôle |
|---|---|---|
| `render(e, x, W, set, i, n)` | requis | positionne l'item `e`. `x` = position relative à l'item actif (0 = centre, négatif = avant), `W` = largeur d'une carte. Appeler `set(e, transform, opacity, zIndex, filter?)` |
| `loop` | `false` | booléen ou `function (n)` : boucle infinie (x ramené dans [-n/2, n/2]) |
| `rel(x, n, loop)` | — | remplace le calcul de `x` (ex. pile : x ∈ ]-1, n-1]) |
| `pad` | `170` | hauteur ajoutée à la plus haute carte pour la scène (`--crsl-h`) |
| `dragFactor` | `0.62` | pixels de glisser par item = largeur × facteur |
| `drift` | — | défilement continu (items par image), pause au survol/glisser |
| `snap` | `true` | recaler sur l'item le plus proche après un glisser |
| `clickCenter` | `true` | un clic sur une carte non active la centre au lieu de suivre le lien |
| `nav` | `true` | afficher les flèches |
| `init(e, i)` | — | appelé sur chaque item à chaque collecte (ex. `data-crsl-n`) |
| `after(activeIndex, items)` | — | appelé après chaque rendu |
| `destroy()` | — | nettoyage spécifique au module |

Variables CSS posées par `set` : `--crsl-t` (transform), `--crsl-o` (opacité), `--crsl-z` (z-index), `--crsl-f`
(filter). Attribut `data-crsl-active="1|0"` sur chaque item. Le conteneur reçoit `data-crsl-stage`.

CSS commun (dans `core.css`) : la liste devient une scène de hauteur `--crsl-h`, `perspective: 1000px`,
items centrés en absolu, largeur `--crsl-card-w`. Le CSS du module ne fait que surcharger (perspective, fond,
largeur, décor) sous `.crsl-<cle>[data-crsl]`.

## Famille 2 : scène

| Fonction | Rôle |
|---|---|
| `C.scene(ct, "crsl-<cle>-stage")` | crée la scène (classe commune `crsl-x-stage`), l'ajoute au conteneur, masque la liste |
| `C.unscene(ct, st)` | retire la scène et réaffiche la liste (à appeler dans `destroy`) |
| `C.fields(item)` | `{ item, img, title, content, color, cutout, link }` d'après le contrat |
| `C.mount(box, f, animate)` | recopie `f.content` dans `box` (classe `crsl-x-content`), retire les `id`, découpe le titre en mots animés, redirige les clics des liens/boutons recopiés vers ceux d'origine, ajoute `crsl-over` si le contenu déborde |
| `C.swipe(el, fn)` | balayage horizontal → `fn(1)` / `fn(-1)` |
| `C.keys(el, fn)` | flèches clavier → `fn(1)` / `fn(-1)` |
| `C.autoplay(ct, el, fn, ms)` | si `crsl-opt-auto` : appelle `fn(1)` toutes les `ms`, pause au survol/focus ; retourne l'id de l'intervalle |
| `C.watch(list, fn)` | observe les changements de la liste d'origine (à relire avec `C.fields`) |

Couleur d'accent : poser `--crsl-accent` sur la scène avec `f.color` quand il existe, sinon la retirer (repli
sur `--inwinkaccentcolor`).

## Conventions CSS

- Classes internes : `crsl-<initiale>-…` (ex. `crsl-c-` pour carte, `crsl-r-` pour rideau) pour éviter les collisions.
- Variables publiques documentées en tête du fichier CSS du module (`/* … – variables : --crsl-… */`).
- Responsive des scènes : `@container (max-width: 700px)` (la scène est un conteneur de requêtes).
- `@media (prefers-reduced-motion: reduce)` pour les animations CSS en boucle.
