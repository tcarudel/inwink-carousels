# Historique

## 1.3.0
- **Variables CSS à deux niveaux** dans `core.css` et tous les modules : `var(--crsl-<cle>-<propriete>,
  var(--crsl-<propriete>, <défaut>))` (radius, border-width, border-color, shadow, gap, duration, accent, bg…).
  Personnalisable par carrousel ou globalement. Liste par carrousel documentée dans le README généré.
- **Gabarits déplacés dans `src/gabarits/`** : chaque fichier JSON est copié tel quel par `build.py` dans
  `dist/crsl/gabarit/` (le gabarit CRSL existant, `gabarit-crsl.json`, a été déplacé sans changement de contenu).
- **Nouveau gabarit `produit-relief.json`** : carte produit avec relief 3D au survol (inspiration CodePen
  « Nike Product Card Parallax 3D », krautgti/VwXNRYE) — image (détourée ou non), titre et pré-titre en grand
  filigrane révélé au survol, halo coloré, palette d'accent cyclique. Contrat `crsl-f-*` ajouté par précaution
  (usage carrousel non déterminé). Le tilt suit le survol/focus (fixe), pas le pointeur en temps réel : les
  gabarits inwink n'ont que du customCSS, pas de JS, contrairement aux modules CRSL.
- **Nouvelle skill `inwink-item-style`** (`.claude/skills/inwink-item-style/`) : création et correction de
  gabarits d'item (apparence, survol), avec méthode de fidélité à l'inspiration (code source réel, table de
  correspondance, comparaison visuelle normal/survol). `docs/conventions.md` centralise les conventions
  partagées avec `inwink-carousel` (structure, préfixes, contrat de gabarit, variables CSS).
- **Skill `inwink-carousel`** : nouvelles étapes obligatoires avant de coder (vérification des champs/gabarits
  nécessaires, fidélité à l'inspiration via le code source réel quand il existe, reconnaissance du cas « style
  d'item » qui renvoie vers `inwink-item-style`).
- **GitHub Action** (`.github/workflows/release.yml`) : crée automatiquement le tag `vX.Y.Z` et la release
  GitHub (à partir du `CHANGELOG.md`) à chaque push sur `main` qui change `VERSION` dans `build.py`.

## 1.2.0
- Nouveau carrousel « Mise au point » (`crsl-focus`, famille 1) : la carte active reste nette et à taille pleine,
  les autres passent en `blur` + `scale(0.9)`. Navigation flèches, molette (`crsl-opt-molette`) et glisser tactile.
- `crsl-focus` : l'image passe en plein cadre avec tilt 3D au pointeur ; le titre/la description/le bouton se
  révèlent au survol (et sur la carte active, pour le tactile) avec un léger zoom de l'image. Option
  `crsl-opt-compact` pour masquer la description (évite les cartes trop hautes).

## 1.1.0
- 15 carrousels : famille 1 (vague, coverflow, equipe, galerie, anneau, pile, verre, bandeau, accordeon,
  defilement, liste) et famille 2 (carte, rideau, diagonale, produit).
- Moteur commun `C.track` pour la famille 1.
- Nouveau contrat famille 2 : `crsl-f-picture`, `crsl-f-title`, `crsl-content` (+ `crsl-f-color` facultatif) ;
  le contenu de l'item est recopié dans la scène et ses liens déclenchent ceux d'origine.

## 1.0.0
- Noyau, vague diagonale (famille 1), carte qui s'agrandit (famille 2), gabarit CRSL.
