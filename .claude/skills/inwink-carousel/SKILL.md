---
name: inwink-carousel
description: Crée, adapte ou corrige des carrousels animés pour les listes d'items inwink, dans la bibliothèque CRSL (classes crsl-*). Utiliser cette skill dès que l'utilisateur partage un lien ou une vidéo d'inspiration (Facebook, Instagram, YouTube, TikTok, Dribbble, CodePen…) pour un effet de carrousel, slider ou galerie, demande d'ajouter ou modifier un carrousel CRSL, de générer une version standalone, de mettre à jour la bibliothèque, ou parle de listes d'items / gabarits inwink, même sans prononcer le mot « carrousel ». Cette skill est centrée sur le **mouvement entre les items** ; pour l'apparence d'un item (gabarit, effet de survol sur la carte), voir la skill `inwink-item-style`. Si une inspiration combine les deux, applique d'abord `inwink-item-style`.
---

# Carrousels inwink (bibliothèque CRSL)

La bibliothèque CRSL transforme une liste d'items inwink en carrousel animé quand on ajoute une classe
(`crsl-<nom>`) au bloc. Elle est livrée de deux façons : un dossier **standalone** par carrousel (un CSS + un JS,
noyau inclus) et une **bibliothèque** (`crsl.js` + `crsl.css`) chargée globalement sur le site.

Conventions partagées avec la skill `inwink-item-style` (préfixes, contrat de gabarit, variables CSS, structure du
dépôt) : `docs/conventions.md`. Lis-le si tu as un doute sur une convention transverse.

Ta mission type : à partir d'une inspiration, créer un nouveau carrousel (ou en modifier un), l'intégrer à la
bibliothèque, régénérer les livrables, tester, puis livrer.

## 0. Trouver le dépôt CRSL (étape bloquante)

- **Claude Code** : le dépôt est normalement le projet courant. Repères : `src/core.js`, `src/mods/`, `build.py`.
- **Chat (claude.ai)**, reconnaissable à l'absence de ces fichiers dans le répertoire de travail : **avant toute
  autre action** (y compris ouvrir le lien d'inspiration ou proposer un design), vérifie qu'un zip du dépôt a été
  joint dans la conversation (dossier des fichiers envoyés). S'il n'y en a pas, **arrête-toi et demande-le** en une
  phrase, par exemple : « Pour travailler sur la dernière version de ta bibliothèque, peux-tu m'envoyer le zip de
  ton dépôt CRSL (celui qui contient `src/` et `build.py`) ? ». Ne reprends qu'une fois le zip reçu.
  Pourquoi : le chat repart de zéro à chaque conversation ; sans le dépôt à jour, le carrousel serait écrit sur une
  version obsolète du noyau et risquerait d'écraser des modifications faites depuis.
- Refuse les zips qui ne contiennent pas `src/core.js` et `build.py` (par exemple le zip `dist`, sans les sources) :
  explique la différence et redemande le bon fichier. Une fois le bon zip reçu, décompresse-le dans le répertoire
  de travail avant toute modification.

Ne réécris jamais le noyau de mémoire : lis toujours `src/core.js` pour connaître l'API réelle de la version en cours.

## 1. Comprendre l'inspiration et vérifier sa fidélité

1. Ouvre le lien. Les vidéos (Facebook, YouTube Shorts…) ne sont souvent pas lisibles avec `web_fetch` ;
   si l'extension Claude in Chrome est disponible, ouvre la page dedans et fais plusieurs captures zoomées à
   quelques secondes d'intervalle pour comprendre le **mouvement**, pas seulement l'image.
   Si la vidéo reste figée sur la première image, c'est souvent que la fenêtre Chrome n'est pas au premier plan :
   demande à l'utilisateur de la mettre au premier plan puis réessaie.
2. **Code source réel, quand il existe** (CodePen, JSFiddle, dépôt public…) : récupère le HTML, le CSS et le JS du
   pen et sers-t'en comme référence exacte, pas seulement comme inspiration visuelle — dimensions, positions,
   états `:hover`/`:focus`, `overflow`, easing et durée des transitions. Une capture ne montre pas un `overflow`
   ou une transition ; le code source, si disponible, si.
3. Sans accès à la vidéo ni au code, demande 2 ou 3 captures (début, milieu, fin) ou une description du mouvement.
4. **Reformule l'effet** en 2-3 phrases (disposition, déclencheur du mouvement, transition) et fais-le valider
   avant de coder. Signale ce qui dépend d'éléments que les items inwink n'ont pas (ex. image détourée).
5. **Table de correspondance** : liste chaque élément visuel de l'inspiration (image, titre, sur-titre, bouton,
   pastille, légende…) et l'élément inwink auquel il correspond (`.picture`, `.title`, `.bloc-accent`,
   `.buttontitle`, un champ de gabarit à créer…). Soumets cette table à l'utilisateur **en cas de doute** (élément
   sans équivalent évident, rôle ambigu) avant de coder.
6. **Cas « style d'item »** : si l'effet à reproduire est un survol ou une recomposition visuelle **sur la carte
   elle-même** (zoom d'image, overlay qui apparaît, changement de mise en page au survol) plutôt qu'un mouvement
   **entre** les items, ce n'est pas cette skill : oriente vers `inwink-item-style`, qui gère le gabarit et son
   effet de survol. Un carrousel peut ensuite s'ajouter par-dessus avec `inwink-carousel` pour le déplacement.

## 2. Vérifier le gabarit (étape bloquante avant de coder)

1. Liste les **champs et options** que le carrousel a besoin de lire sur chaque item (image, titre, sur-titre,
   description, couleur, bouton, image détourée, champ spécifique à l'inspiration…).
2. Compare cette liste aux gabarits existants dans `src/gabarits/` (dont `gabarit-crsl.json`, le gabarit CRSL de
   référence pour la famille 2) et aux gabarits standards documentés dans
   `references/architecture.md` (article/overlay, listes dynamiques).
3. **S'il manque un champ ou une option** (ex. une légende, un badge, une seconde image) : signale-le à
   l'utilisateur **avant de coder** et propose soit de l'ajouter à un gabarit existant, soit d'en créer un nouveau.
   Attends sa réponse avant de continuer.
4. Si un nouveau gabarit (ou une variante) est nécessaire : crée-le avec la skill `inwink-item-style` (contrat
   `crsl-f-*` à appliquer si ce carrousel est de famille 2, voir sa skill) — le fichier final vit dans
   `src/gabarits/<nom>.json`, copié tel quel par `build.py` dans `dist/crsl/gabarit/`. Ne jamais éditer un gabarit
   dans `dist/`.

## 3. Choisir la famille

Lis `references/architecture.md` si tu as un doute. Règle de décision :

- **Famille 1** — l'effet déplace, transforme, masque ou révèle des **cartes entières** (3D, défilement, pile,
  accordéon…). Les items d'origine sont animés **sur place**. Fonctionne avec **tous** les gabarits, y compris les
  listes dynamiques (speakers, sessions, partenaires). C'est le choix par défaut.
- **Famille 2** — l'effet **recompose** l'item : grande image de fond, titre géant, contenu séparé de l'image,
  vignettes, couleur par item. La liste d'origine est masquée et une scène est construite à partir du contrat de
  classes du gabarit CRSL (`docs/conventions.md`, section 3). Réservé aux listes **statiques**.

Si un effet peut se faire en famille 1, préfère-la : elle conserve le rendu du gabarit et les boutons inwink.

## 4. Nommer

Clé courte en français, sans accent ni espace : `crsl-<cle>` (ex. `crsl-vague`, `crsl-rideau`).
Vérifie qu'elle n'existe pas déjà dans `CAROUSELS` (`build.py`).

## 5. Écrire le module

Crée `src/mods/<cle>.js` et `src/mods/<cle>.css` à partir des modèles :

- Famille 1 : `assets/template-famille1.js` / `.css` (moteur `C.track`), ou un module autonome si l'effet ne se
  résume pas à « positionner des cartes » (voir `accordeon.js`, `defilement.js`, `liste.js`).
- Famille 2 : `assets/template-famille2.js` / `.css` (`C.scene`, `C.fields`, `C.mount`).

Inspire-toi du module existant le plus proche dans `src/mods/` : c'est la meilleure référence de style.
L'API du noyau est décrite dans `references/core-api.md`.

Règles à respecter, et pourquoi :

- **Ne jamais modifier `className` ni déplacer/supprimer des nœuds de la liste d'origine** : inwink est une
  application React, qui écraserait les changements ou planterait. Utilise des attributs `data-crsl-*`, des
  variables CSS (`style.setProperty`) et des éléments ajoutés **à la fin du conteneur**.
- **Préfixer toutes les classes** par `crsl-` : le CSS personnalisé des gabarits cible des classes génériques
  (`.card`, `.picture`, `.title`…). Voir `docs/conventions.md` pour la liste des préfixes.
- **Scoper le CSS** sur `.crsl-<cle>[data-crsl]` (famille 1) ou sur la classe de la scène (famille 2), pour que
  retirer la classe du bloc rende la liste d'origine intacte.
- **Variables CSS à deux niveaux** : toute propriété d'apparence (radius, border-width, border-color, shadow, gap,
  duration, accent, bg…) s'écrit `var(--crsl-<cle>-<propriete>, var(--crsl-<propriete>, <défaut>))` — voir
  `docs/conventions.md`, section 4. Documente la liste des variables du module en tête du fichier CSS
  (`/* <Nom> – variables : --crsl-<cle>-... */`) : `build.py` la reprend dans le README généré.
- **Ne jamais recopier des liens pour naviguer soi-même** : en famille 2, `C.mount` redirige les clics vers les
  liens d'origine (navigation interne inwink). En famille 1, les liens d'origine restent en place.
- **Tout doit pouvoir être détruit** : l'objet retourné par `init` expose `destroy()` qui retire écouteurs,
  observateurs, éléments ajoutés et variables CSS.
- **Accessibilité** : respecter `C.reduce` (réduire les animations), garder les flèches clavier, `aria-label` sur
  les boutons ajoutés (textes via `C.L`).
- **Options** : réutiliser `crsl-opt-molette` et `crsl-opt-auto` quand elles ont du sens plutôt que d'en inventer.

## 6. Comparer visuellement à l'inspiration

Quand le code source de l'inspiration est disponible (étape 1), compare **visuellement** ta version à l'original
avant de passer à la suite :

1. Construis (étape 8) et ouvre `dist/crsl/demo/index.html` dans le navigateur.
2. Capture l'original et ta version côte à côte, en **état normal** puis en **état survolé** (et actif si
   pertinent), à une largeur d'écran comparable.
3. Compare précisément : proportions, espacement, couleurs, position du texte, vitesse et courbe de la
   transition.
4. **Itère** sur le module (JS/CSS) jusqu'à correspondance raisonnable ; documente dans le résumé final les écarts
   assumés (ex. contrainte du DOM inwink) plutôt que de les laisser silencieux.

## 7. Brancher dans le build

Dans `build.py` :
1. Ajoute une ligne à `CAROUSELS` : `("<cle>", "<Nom lisible>", <famille>, "<options>")`.
2. Ajoute une section à `SECTIONS` (démo) avec le gabarit adapté : `item_default` / `item_overlay` pour la famille 1,
   `item_crsl` pour la famille 2 (avec `cutout=True` et une image détourée si besoin), ou une génération d'items
   dédiée si un gabarit spécifique (étape 2) a été créé.

## 8. Construire et tester

```bash
python3 build.py
python3 .claude/skills/inwink-carousel/scripts/smoke_test.py dist/crsl/demo/index.html
```

Le test vérifie que chaque carrousel s'initialise sans erreur JavaScript et produit une capture par carrousel dans
`dist/screens/`. **Regarde les captures** du carrousel créé (et au moins un voisin, pour détecter une régression du
noyau). Teste aussi une interaction (flèche, clic sur une carte latérale) et une largeur mobile (390 px) si le
module a une mise en page responsive. Si Playwright n'est pas installé : `pip install playwright && playwright install chromium`.

**Ne jamais modifier `dist/` à la main** : il est entièrement régénéré par `build.py`. Après le build, vérifie que
`dist/crsl/demo/index.html` contient bien la nouvelle section du carrousel créé.

## 9. Livrer

- **Claude Code** : incrémente `VERSION` dans `build.py` (mineure pour un nouveau carrousel, patch pour une
  correction), ajoute une entrée dans `CHANGELOG.md`, relance le build, vérifie que `dist/crsl/demo/index.html`
  contient le nouveau carrousel, puis propose un commit qui inclut `dist/` (versionné, voir `README.md`). Ne
  pousse et ne crée de tag que si l'utilisateur le demande : une GitHub Action crée automatiquement le tag et la
  release quand `VERSION` change sur `main` (voir `.github/workflows/`).
- **Chat** : livre le zip `dist/crsl-vX.Y.Z.zip` **et** un zip du dépôt mis à jour (sources + build), pour que
  l'utilisateur puisse le remplacer dans son dépôt.

Termine par un résumé court : classe à ajouter au bloc, famille, gabarits compatibles, variables CSS exposées,
options, points d'attention (et, le cas échéant, les écarts assumés avec l'inspiration).

## Références

- `docs/conventions.md` — structure du dépôt, préfixes, contrat de gabarit, convention des variables CSS.
- `references/architecture.md` — DOM inwink, contraintes React, familles, pièges connus.
- `references/core-api.md` — API du noyau (`C.track`, `C.fields`, `C.mount`, `C.scene`…) et variables CSS.
- `assets/` — modèles de modules famille 1 et famille 2.
- `scripts/smoke_test.py` — test automatique de la démo.
