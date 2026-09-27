---
name: inwink-item-style
description: Crée ou adapte un gabarit d'item pour les listes d'items inwink (template JSON, itemDefinition, customCSS) — apparence de la carte, mise en page, effet de survol. Utiliser cette skill quand l'utilisateur partage une inspiration (image, capture, CodePen…) d'une carte/vignette/item de liste (pas un mouvement entre plusieurs items), demande de créer ou modifier un gabarit inwink, de changer l'apparence ou le survol d'un item, d'ajouter un champ à un gabarit, ou quand la skill `inwink-carousel` détecte un « cas style d'item » et te renvoie ici. Cette skill est centrée sur l'**apparence d'un item isolé** ; pour le mouvement entre plusieurs items (carrousel, slider), voir la skill `inwink-carousel`. Si une inspiration combine les deux (une carte élaborée dans un carrousel qui glisse), applique **d'abord** cette skill pour la carte, puis `inwink-carousel` pour le mouvement.
---

# Gabarits d'item inwink (apparence, survol)

Un gabarit inwink décrit l'apparence d'un item de liste (statique) : les champs saisis en back-office
(`itemDefinition`), l'arbre HTML rendu (`template`) et son CSS (`customCSS`). Cette skill crée et corrige ces
gabarits — mise en page, effet de survol, disposition — indépendamment de tout carrousel.

Conventions partagées avec la skill `inwink-carousel` (préfixes, contrat de gabarit, variables CSS, structure du
dépôt) : `docs/conventions.md`. Lis-le si tu as un doute sur une convention transverse. Format détaillé d'un
gabarit (types de champs, structure JSON) : `references/gabarit-format.md`.

## 0. Trouver le dépôt CRSL

Mêmes repères et même procédure que la skill `inwink-carousel`, section 0 : le dépôt courant doit contenir
`src/`, `build.py` (et maintenant `src/gabarits/`). En chat sans ces fichiers, demande le zip du dépôt avant
toute autre action.

## 1. Comprendre l'inspiration et vérifier sa fidélité

1. Ouvre le lien ou regarde l'image/capture fournie. Pour une carte avec effet de survol, il faut voir **l'état
   normal et l'état survolé** : si l'utilisateur n'a fourni qu'une capture, demande explicitement une capture (ou
   une description) de l'état survolé avant de coder.
2. **Code source réel, quand il existe** (CodePen, JSFiddle…) : récupère le HTML, le CSS et le JS et sers-t'en
   comme référence exacte — dimensions, positions, `:hover`/`:focus`, `overflow`, easing et durée des
   transitions — pas seulement comme inspiration visuelle.
3. **Reformule** la disposition et l'effet de survol en 2-3 phrases et fais-les valider avant de coder.
4. **Table de correspondance** : liste chaque élément visuel (image, titre, sur-titre, description, bouton,
   badge, légende…) et le champ inwink auquel il correspond (existant ou à créer). Soumets-la à l'utilisateur
   **en cas de doute** (élément sans équivalent évident, rôle ambigu) avant de coder.

## 2. Lister les champs et vérifier les gabarits existants (étape bloquante avant de coder)

1. Liste les **champs et options** nécessaires (image, image détourée, titre, sur-titre, description, bouton,
   couleur, badge, second lien, etc.).
2. Compare cette liste aux gabarits déjà présents dans `src/gabarits/` et aux gabarits standards documentés dans
   `.claude/skills/inwink-carousel/references/architecture.md` (article/overlay).
3. **S'il manque un champ ou une option**, signale-le à l'utilisateur **avant de coder** — propose de l'ajouter à
   un gabarit existant ou d'en créer un nouveau — et attends sa réponse.

## 3. Demander l'usage prévu avec un carrousel (étape obligatoire avant de créer le gabarit)

Avant de créer le gabarit, demande à l'utilisateur : **« Ce gabarit sera-t-il utilisé avec un carrousel CRSL ? Si
oui, lequel ? »**. La réponse détermine si le contrat de classes `crsl-f-*` (`docs/conventions.md`, section 3)
s'applique :

- **Pas de carrousel, ou carrousel de la famille 1** : aucun contrat imposé. La famille 1 anime les items
  d'origine tels quels (elle lit le DOM du gabarit, pas des classes `crsl-f-*`) ; le gabarit est donc **libre**.
- **Carrousel de la famille 2** : ajoute les classes du contrat sur les bons blocs — `crsl-f-picture` (conteneur
  de l'image), `crsl-f-title` (titre), `crsl-content` (conteneur du contenu hors image), et `crsl-f-color` si
  l'item porte une couleur exploitée par le carrousel. Vérifie dans
  `.claude/skills/inwink-carousel/references/architecture.md` de quelle famille relève le carrousel visé si
  l'utilisateur ne le sait pas précisément.
- **Utilisateur incertain** : ajoute le contrat **par précaution**. Il n'a aucun effet visuel tant qu'aucun
  carrousel de famille 2 n'est appliqué au bloc (les classes `crsl-f-*` sont des marqueurs, pas des styles).

Indique ce choix (et les carrousels compatibles) dans le résumé final.

## 4. Construire le gabarit JSON

Crée `src/gabarits/<nom>.json` (jamais dans `dist/` — voir `docs/conventions.md`, section 5). Structure détaillée :
`references/gabarit-format.md`. En résumé :

- `properties.itemDefinition.fields` : un champ par donnée saisie en back-office (`picture`, `Text`,
  `multilinetext`, `bool`, `selectlist`…).
- `properties.template.blocs` : l'arbre HTML rendu, avec `className`, `showIf` (affichage conditionnel sur un
  champ) et `conditionalClasses` (classes posées sur la racine selon la valeur d'un champ — utile pour varier la
  mise en page ou activer une option de survol).
- `customCSS` : le CSS du gabarit, scopé avec `##contentid` (remplacé par l'id du bloc à l'exécution). C'est ici
  que vit l'effet de survol (`##contentid .picture:hover { … }` ou un survol porté par la racine `.itemcontent`).
- `properties.items` : 3 à 5 items de démonstration réalistes (utilisés par l'aperçu back-office).

Inspire-toi de `src/gabarits/gabarit-crsl.json` (gabarit de référence) pour le style d'écriture.

Règles à respecter, et pourquoi :

- **Toujours scoper le CSS sur `##contentid`** : plusieurs blocs peuvent utiliser le même gabarit sur une même
  page ; sans ce scope, les styles fuient d'un bloc à l'autre.
- **Variables CSS à deux niveaux** pour toute propriété d'apparence exposée (radius, border-width, border-color,
  shadow, gap, duration, accent…) : `var(--crsl-<nom-gabarit>-<propriete>, var(--crsl-<propriete>, <défaut>))` —
  voir `docs/conventions.md`, section 4. Documente la liste en commentaire en tête du `customCSS`.
  Un gabarit sans classe `crsl-*` sur le bloc n'a pas de préfixe `crsl-` obligatoire dans son propre CSS interne,
  mais réutiliser la même convention de variables facilite la cohérence avec les carrousels qui liront ce gabarit.
- **Ne jamais dupliquer un champ texte sans raison** : réutilise `title`, `pretitle`, `description`,
  `buttontitle` quand le rôle correspond, pour rester compatible avec les gabarits et carrousels existants.
- **`useItemLink: true`** sur le seul lien/bouton cliquable si l'item entier n'est pas cliquable ; sinon
  `doNotApplyLink: true` sur le template et un `<a>` racine (voir gabarit overlay dans `architecture.md`).
- **Accessibilité** : contraste suffisant en état survolé, pas d'information uniquement portée par `:hover`
  (aussi accessible au clavier via `:focus-within`/`:focus-visible`).

## 5. Comparer visuellement à l'inspiration

Quand le code source de l'inspiration est disponible :

1. Construis (`python3 build.py`) pour copier le gabarit dans `dist/crsl/gabarit/`, et prévois un aperçu local
   (ajoute temporairement une section à la démo `build.py`/`SECTIONS`, ou une page HTML minimale) pour visualiser
   le rendu réel du template + customCSS.
2. Capture l'original et ta version côte à côte, en **état normal** puis **survolé**.
3. Compare précisément : proportions, espacement, couleurs, position du texte, vitesse et courbe de transition.
4. **Itère** jusqu'à correspondance raisonnable ; documente les écarts assumés dans le résumé final.

## 6. Livrer

- **Ne jamais modifier `dist/`** : `build.py` copie `src/gabarits/*.json` tel quel dans `dist/crsl/gabarit/`.
- Relance `python3 build.py` et vérifie que le gabarit apparaît bien dans `dist/crsl/gabarit/`.
- Résumé final : nom du fichier gabarit, champs disponibles, contrat `crsl-f-*` appliqué ou non (et pourquoi,
  d'après la réponse à l'étape 3), carrousels compatibles, variables CSS exposées, points d'attention (écarts
  assumés avec l'inspiration, contraintes d'accessibilité).

## Références

- `docs/conventions.md` — structure du dépôt, préfixes, contrat de gabarit, convention des variables CSS.
- `references/gabarit-format.md` — structure JSON détaillée d'un gabarit (types de champs, blocs, customCSS).
- `.claude/skills/inwink-carousel/references/architecture.md` — DOM inwink, gabarits standards, familles de
  carrousel (pour savoir si le contrat `crsl-f-*` s'applique).
- `src/gabarits/gabarit-crsl.json` — gabarit de référence, à prendre comme modèle d'écriture.
