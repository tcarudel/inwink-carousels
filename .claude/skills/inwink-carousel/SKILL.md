---
name: inwink-carousel
description: Crée, adapte ou corrige des carrousels animés pour les listes d'items inwink, dans la bibliothèque CRSL (classes crsl-*). Utiliser cette skill dès que l'utilisateur partage un lien ou une vidéo d'inspiration (Facebook, Instagram, YouTube, TikTok, Dribbble, CodePen…) pour un effet de carrousel, slider ou galerie, demande d'ajouter ou modifier un carrousel CRSL, de générer une version standalone, de mettre à jour la bibliothèque, ou parle de listes d'items / gabarits inwink, même sans prononcer le mot « carrousel ».
---

# Carrousels inwink (bibliothèque CRSL)

La bibliothèque CRSL transforme une liste d'items inwink en carrousel animé quand on ajoute une classe
(`crsl-<nom>`) au bloc. Elle est livrée de deux façons : un dossier **standalone** par carrousel (un CSS + un JS,
noyau inclus) et une **bibliothèque** (`crsl.js` + `crsl.css`) chargée globalement sur le site.

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

## 1. Comprendre l'inspiration

1. Ouvre le lien. Les vidéos (Facebook, YouTube Shorts…) ne sont souvent pas lisibles avec `web_fetch` ;
   si l'extension Claude in Chrome est disponible, ouvre la page dedans et fais plusieurs captures zoomées à
   quelques secondes d'intervalle pour comprendre le **mouvement**, pas seulement l'image.
   Si la vidéo reste figée sur la première image, c'est souvent que la fenêtre Chrome n'est pas au premier plan :
   demande à l'utilisateur de la mettre au premier plan puis réessaie.
2. Sans accès à la vidéo, demande 2 ou 3 captures (début, milieu, fin) ou une description du mouvement.
3. **Reformule l'effet** en 2-3 phrases (disposition, déclencheur du mouvement, transition) et fais-le valider
   avant de coder. Signale ce qui dépend d'éléments que les items inwink n'ont pas (ex. image détourée).

## 2. Choisir la famille

Lis `references/architecture.md` si tu as un doute. Règle de décision :

- **Famille 1** — l'effet déplace, transforme, masque ou révèle des **cartes entières** (3D, défilement, pile,
  accordéon…). Les items d'origine sont animés **sur place**. Fonctionne avec **tous** les gabarits, y compris les
  listes dynamiques (speakers, sessions, partenaires). C'est le choix par défaut.
- **Famille 2** — l'effet **recompose** l'item : grande image de fond, titre géant, contenu séparé de l'image,
  vignettes, couleur par item. La liste d'origine est masquée et une scène est construite à partir du contrat de
  classes du gabarit CRSL. Réservé aux listes **statiques**.

Si un effet peut se faire en famille 1, préfère-la : elle conserve le rendu du gabarit et les boutons inwink.

## 3. Nommer

Clé courte en français, sans accent ni espace : `crsl-<cle>` (ex. `crsl-vague`, `crsl-rideau`).
Vérifie qu'elle n'existe pas déjà dans `CAROUSELS` (`build.py`).

## 4. Écrire le module

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
  (`.card`, `.picture`, `.title`…).
- **Scoper le CSS** sur `.crsl-<cle>[data-crsl]` (famille 1) ou sur la classe de la scène (famille 2), pour que
  retirer la classe du bloc rende la liste d'origine intacte.
- **Ne jamais recopier des liens pour naviguer soi-même** : en famille 2, `C.mount` redirige les clics vers les
  liens d'origine (navigation interne inwink). En famille 1, les liens d'origine restent en place.
- **Tout doit pouvoir être détruit** : l'objet retourné par `init` expose `destroy()` qui retire écouteurs,
  observateurs, éléments ajoutés et variables CSS.
- **Accessibilité** : respecter `C.reduce` (réduire les animations), garder les flèches clavier, `aria-label` sur
  les boutons ajoutés (textes via `C.L`).
- **Options** : réutiliser `crsl-opt-molette` et `crsl-opt-auto` quand elles ont du sens plutôt que d'en inventer.

## 5. Brancher dans le build

Dans `build.py` :
1. Ajoute une ligne à `CAROUSELS` : `("<cle>", "<Nom lisible>", <famille>, "<options>")`.
2. Ajoute une section à `SECTIONS` (démo) avec le gabarit adapté : `item_default` / `item_overlay` pour la famille 1,
   `item_crsl` pour la famille 2 (avec `cutout=True` et une image détourée si besoin).

## 6. Construire et tester

```bash
python3 build.py
python3 .claude/skills/inwink-carousel/scripts/smoke_test.py dist/crsl/demo/index.html
```

Le test vérifie que chaque carrousel s'initialise sans erreur JavaScript et produit une capture par carrousel dans
`dist/screens/`. **Regarde les captures** du carrousel créé (et au moins un voisin, pour détecter une régression du
noyau). Teste aussi une interaction (flèche, clic sur une carte latérale) et une largeur mobile (390 px) si le
module a une mise en page responsive. Si Playwright n'est pas installé : `pip install playwright && playwright install chromium`.

## 7. Livrer

- **Claude Code** : incrémente `VERSION` dans `build.py` (mineure pour un nouveau carrousel, patch pour une
  correction), ajoute une entrée dans `CHANGELOG.md`, relance le build, puis propose un commit. Ne pousse et ne
  crée de tag que si l'utilisateur le demande.
- **Chat** : livre le zip `dist/crsl-vX.Y.Z.zip` **et** un zip du dépôt mis à jour (sources + build), pour que
  l'utilisateur puisse le remplacer dans son dépôt.

Termine par un résumé court : classe à ajouter au bloc, famille, gabarits compatibles, options, points d'attention.

## Références

- `references/architecture.md` — DOM inwink, contraintes React, familles, contrat du gabarit CRSL, pièges connus.
- `references/core-api.md` — API du noyau (`C.track`, `C.fields`, `C.mount`, `C.scene`…) et variables CSS.
- `assets/` — modèles de modules famille 1 et famille 2.
- `scripts/smoke_test.py` — test automatique de la démo.
