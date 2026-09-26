# Architecture CRSL et contexte inwink

## Sommaire
1. Fonctionnement des listes d'items inwink
2. DOM de référence
3. Contraintes techniques
4. Les deux familles
5. Contrat du gabarit CRSL (famille 2)
6. Pièges connus

## 1. Fonctionnement des listes d'items inwink

- Un bloc « liste d'items » a un **mode d'affichage** : *Liste* ou *Carrousel*. CRSL ne fonctionne qu'en mode
  **Liste** : le mode Carrousel charge slick, qui transforme le DOM et duplique les items. Le noyau détecte
  `.slick-slider` et affiche un avertissement dans la console au lieu d'agir.
- **Nombre max d'éléments** : inwink ne rend que N items dans le DOM ; CRSL le respecte donc naturellement.
- **Colonnes** (mode réactif ou fluide) : réglage conservé par inwink mais sans effet une fois le bloc transformé.
- **Items statiques** : saisis sur la page. Leur gabarit est un JSON composé de :
  - `itemDefinition.fields` : les champs que voit l'utilisateur du back-office (texte, image, booléen, liste…) ;
  - `template` : l'arbre HTML (`blocs`), avec `className`, `showIf` (affichage conditionnel) et
    `conditionalClasses` (options d'item qui deviennent des classes sur l'élément racine, souvent un `article`) ;
  - `customCSS` : CSS du gabarit, où `##contentid` est remplacé par l'id du bloc (`#ct-<uuid>`).
- **Items dynamiques** (speakers, sessions, partenaires…) : données du back-office, gabarits JSON différents,
  possibilité de filtres, recherche et scroll infini (les items changent après coup). Seule la **famille 1** s'y
  applique pour l'instant.

## 2. DOM de référence

Conteneur du bloc (c'est lui qui reçoit la classe `crsl-<cle>`) :

```html
<div id="ct-<uuid>" class="itemslist dynamicbloc-contentwrapper bloc-itemslist crsl-vague">
  <div class="dynamiccontentbloc">
    <!-- parfois un <header class="bloc-header"> -->
    <div class="inwink-items teaser-list legacyflex layout-L-col4 … layout-col4">
      <div class="inwink-item " id="item-<uuid>"> … </div>   <!-- id parfois vide : "item-" -->
    </div>
  </div>
  <div class="iw-clearfix"></div>
  <style>/* customCSS du gabarit */</style>
</div>
```

Gabarit statique par défaut (`article`, lien uniquement sur le bouton) :

```html
<article class="itemcontent clickable text-left card [horizontal] [image-right] [image-dark|image-light]">
  <div class="picture-wrapper"><img class="picture" loading="lazy" src="…" [srcset="… 400w, … 800w"]></div>
  <div class="content-wrapper">
    <header class="header-container"><h4 class="bloc-accent">Pré-titre</h4><h3 class="title">Titre</h3></header>
    <div class="description">…</div>
    <a class="buttontitle link-inwink" role="button" href="/…">Cliquez ici</a>
  </div>
</article>
```

Gabarit overlay (tout l'item est un lien, pas de bouton) :

```html
<a class="itemcontent clickable text-left link-inwink" href="/…">
  <div class="picture-wrapper"><img class="picture" …></div>
  <div class="overlay"><h3 class="title">…</h3><div class="description">…</div></div>
</a>
```

Listes dynamiques (exemples) : speakers `a.itemcontent.card > img.image + .detail > h4.name.bloc-accent + h5…`,
partenaires `.picture-container .logo img.logo-photo` (logos, `object-fit: contain`), sessions sans image avec
`.info`, `h4.bloc-title`, intervenants, bouton « Ajouter à mon agenda » (gestionnaire React).
Attention : la sémantique varie (`.bloc-accent` est le pré-titre dans les statiques mais le nom dans les speakers).

Les textes sont toujours enveloppés : `<span class="fieldval"><span class="fieldtext">…</span></span>`.

## 3. Contraintes techniques

- **React** : ne pas modifier `className`, ne pas déplacer, cloner-pour-remplacer ni supprimer les nœuds rendus
  par inwink. Autorisé : attributs `data-*`, `style.setProperty` (variables CSS), écouteurs d'événements, ajout
  d'éléments à la fin du conteneur `#ct-…`.
- **Liens** : les liens inwink passent par le routeur de l'application. Pour naviguer depuis un élément ajouté,
  déclencher `.click()` sur le lien d'origine (même masqué) plutôt que de changer `location`.
- **Rendus successifs** : le noyau observe le document (ajouts de nœuds, changements de classes) ; il détruit et
  réinitialise une instance si la liste d'origine est remplacée ou si la classe est retirée.
- **Images** : `loading="lazy"`, parfois `srcset` ; `C.largestSrc` choisit la plus grande.
- **Couleur d'accent inwink** : variable CSS `--inwinkaccentcolor`.

## 4. Les deux familles

**Famille 1 — sur place.** CSS : `[data-crsl-stage] .inwink-items` devient une scène `position: relative` ;
chaque `.inwink-item` est centré en absolu et transformé via `--crsl-t`, `--crsl-o`, `--crsl-z`, `--crsl-f`.
Moteur `C.track` : boucle d'animation lissée, glisser, clic sur une carte latérale pour la centrer (sans suivre le
lien), flèches, clavier, options molette/auto, suivi des ajouts d'items et des tailles.
Modules autonomes quand l'effet n'est pas un positionnement de cartes : accordéon (flex + `data-crsl-active`),
défilement au scroll (sticky + translation), liste + aperçu (image qui suit le curseur).
Existants : vague, coverflow, equipe, galerie, anneau, pile, verre, bandeau, accordeon, defilement, liste.

**Famille 2 — scène.** `C.scene` ajoute une scène au conteneur et masque la liste (`[data-crsl-scene]`).
Les champs de chaque item sont lus avec `C.fields`, le contenu de l'item actif est recopié avec `C.mount`.
Existants : carte, rideau, diagonale, produit.

## 5. Contrat du gabarit CRSL (famille 2)

| Sélecteur | Rôle | Statut |
|---|---|---|
| `.crsl-f-picture` | conteneur de l'image principale (`img` à l'intérieur) | obligatoire |
| `.crsl-f-title` | titre : animé mot par mot dans la scène, repris dans les vignettes | obligatoire |
| `.crsl-content` | tout le contenu hors image, recopié tel quel dans la scène | obligatoire |
| `.crsl-f-color` | texte d'une couleur CSS (hexa, rgb, rgba, hsl), masqué | facultatif |
| `.image-cutout` | classe conditionnelle sur la racine de l'item : image détourée (PNG transparent) | facultatif |

Replis pour les gabarits standards : `.picture-wrapper img`, `.title` / `h3`, `.content-wrapper` / `.overlay`.
Si l'item contient `.crsl-content`, aucune autre image que `.crsl-f-picture img` n'est prise comme image principale.
L'utilisateur peut ajouter librement des champs dans `.crsl-content` ; ils apparaissent dans la scène.
Le gabarit de référence est généré par `build.py` (`dist/crsl/gabarit/gabarit-crsl.json`).

## 6. Pièges connus

- Un parent en `overflow: hidden/auto` empêche l'épinglage de `crsl-defilement` (`position: sticky`).
- `crsl-bandeau` a besoin d'assez d'items pour couvrir la largeur, sinon la boucle se voit.
- Les boucles infinies de la famille 1 (`loop`) ne sont activées qu'au-delà d'un certain nombre d'items : en
  dessous, une carte « sauterait » d'un bord à l'autre.
- La hauteur de scène famille 1 se calcule sur la plus haute carte + `pad` ; si des éléments débordent en haut
  (translation verticale, rotation), augmenter `pad`.
- `translate` (propriété CSS) centre les items ; `transform` porte l'effet. Les deux se cumulent : ne pas utiliser
  `translate` dans `--crsl-t` pour centrer.
- Le style inline `transform`/`opacity` posé par certains gabarits (partenaires) est neutralisé par les `!important`
  du CSS de scène.
