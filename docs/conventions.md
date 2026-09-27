# Conventions du dépôt CRSL

Document de référence partagé par les skills [`inwink-carousel`](../.claude/skills/inwink-carousel/SKILL.md)
(mouvement entre items) et [`inwink-item-style`](../.claude/skills/inwink-item-style/SKILL.md) (apparence d'un
item). Si une inspiration combine les deux (ex. une carte avec un effet de survol élaboré, dans un carrousel qui
glisse), on applique **d'abord** `inwink-item-style` pour le gabarit/l'item, puis `inwink-carousel` pour le
mouvement entre les items.

## 1. Structure du dépôt

```
src/
  core.js, core.css        noyau commun CRSL (voir inwink-carousel/references/core-api.md)
  mods/<cle>.js + .css     un module par carrousel (mouvement entre items)
  gabarits/<nom>.json      gabarits inwink (JSON complet : itemDefinition + template + customCSS)
docs/
  conventions.md           ce document
.claude/skills/
  inwink-carousel/         skill : créer/adapter un carrousel CRSL (mouvement)
  inwink-item-style/       skill : créer/adapter un gabarit d'item inwink (apparence, survol)
dist/                      généré par build.py — NE JAMAIS MODIFIER À LA MAIN
build.py                   génère dist/ à partir de src/
CHANGELOG.md
```

`build.py` copie chaque fichier de `src/gabarits/*.json` tel quel dans `dist/crsl/gabarit/`. Un gabarit se crée
et se corrige uniquement dans `src/gabarits/`, jamais dans `dist/`.

## 2. Préfixes de classes

- `crsl-<cle>` : classe posée sur le bloc pour activer un carrousel (ex. `crsl-vague`). `<cle>` est une clé courte
  en français, sans accent ni espace.
- `crsl-<initiale>-…` : classes internes d'un module, pour éviter les collisions entre modules (ex. `crsl-c-` pour
  carte, `crsl-r-` pour rideau, `crsl-d-` pour diagonale).
- `crsl-opt-<option>` : option activable en ajoutant la classe sur le bloc (ex. `crsl-opt-molette`, `crsl-opt-auto`).
- `crsl-f-<champ>` : classes du **contrat de gabarit** (ci-dessous), posées dans le template JSON d'un gabarit.
- `data-crsl`, `data-crsl-*` : attributs posés par le noyau ou un module sur le DOM inwink (jamais de `className`
  modifié — voir `inwink-carousel/references/architecture.md`, section Contraintes techniques).

## 3. Contrat de gabarit `crsl-f-*` (famille 2 et gabarits « avec contrat »)

| Sélecteur | Rôle | Statut |
|---|---|---|
| `.crsl-f-picture` | conteneur de l'image principale (`img` à l'intérieur) | obligatoire |
| `.crsl-f-title` | titre : animé mot par mot dans la scène, repris dans les vignettes | obligatoire |
| `.crsl-content` | tout le contenu hors image, recopié tel quel dans la scène | obligatoire |
| `.crsl-f-color` | texte d'une couleur CSS (hexa, rgb, rgba, hsl), masqué à l'affichage normal | facultatif |
| `.image-cutout` | classe conditionnelle sur la racine de l'item : image détourée (PNG transparent) | facultatif |

Ce contrat permet à un carrousel de famille 2 (`C.fields`, voir `core-api.md`) de lire n'importe quel gabarit qui
le respecte. Quand faut-il l'imposer à un gabarit créé par `inwink-item-style` ? Voir la skill : la réponse dépend
de la famille du carrousel visé (aucun contrat pour la famille 1 ou l'absence de carrousel, contrat pour la
famille 2, contrat par précaution si l'usage futur est incertain).

## 4. Variables CSS — convention à deux niveaux

Toute propriété d'apparence exposée (radius, border-width, border-color, shadow, gap, duration, accent, bg…)
s'écrit avec **deux niveaux de repli** :

```css
var(--crsl-<cle>-<propriete>, var(--crsl-<propriete>, <valeur par défaut>))
```

- **Niveau 1 — spécifique** : `--crsl-<cle>-<propriete>` (ex. `--crsl-carte-radius`) ne s'applique qu'à ce
  carrousel précis. Permet de personnaliser un seul bloc sans toucher aux autres.
- **Niveau 2 — global** : `--crsl-<propriete>` (ex. `--crsl-radius`) s'applique à tous les carrousels qui exposent
  cette propriété. Permet de fixer une charte visuelle une fois pour toutes (rayon, durée, accent…) sur le site.
- **Valeur par défaut** : celle du design d'origine, inchangée si aucune variable n'est définie.

Propriétés concernées en priorité : `radius`, `border-width`, `border-color`, `shadow`, `gap`, `duration`,
`accent`, `bg` (fond, quand le module en expose un). Une propriété déjà nommée spécifiquement dans un module
(ex. `--crsl-diag-ink`) suit la même logique : `--crsl-<cle>-diag-ink` puis `--crsl-diag-ink`.

Dans `core.css`, qui n'est pas scopé à un carrousel précis, seul le niveau global s'applique
(`var(--crsl-<propriete>, <défaut>)`) : c'est la base sur laquelle chaque module ajoute son niveau spécifique.

**Où définir une valeur ?** Jamais dans `core.css`, un module ou un gabarit (ces fichiers restent identiques
partout où la bibliothèque est chargée). Toujours dans le CSS propre au site qui utilise CRSL — c'est ce qui
permet à deux sites de charger la même bibliothèque avec des rendus différents :
```css
:root { --crsl-radius: 4px; --crsl-accent: #123456; }   /* valeur par défaut pour tout le site */
.crsl-carte { --crsl-carte-radius: 16px; }              /* un seul carrousel */
```

Chaque fichier CSS de module documente en tête (`/* <Nom> – variables : --crsl-<cle>-... */`) la liste de ses
variables spécifiques ; `build.py` reprend cette liste dans le README généré (section « Variables CSS » par
carrousel).

## 5. Ne jamais modifier `dist/`

`dist/` est entièrement régénéré par `python3 build.py` à partir de `src/`. Toute correction se fait dans `src/`
(module, gabarit, noyau), jamais directement dans `dist/`. Après un build, vérifier que
`dist/crsl/demo/index.html` contient bien le nouveau carrousel ou gabarit avant de proposer un commit, et inclure
`dist/` dans le commit (il est versionné, voir `README.md`).
