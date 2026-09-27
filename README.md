# CRSL – dépôt source

Carrousels pour les listes d'items inwink. Ce dépôt contient les **sources** ; les fichiers à utiliser sur le site
sont générés dans `dist/`.

## Structure
- `src/core.js`, `src/core.css` : noyau commun (détection des blocs, moteur famille 1, scène famille 2).
- `src/mods/<cle>.js` + `<cle>.css` : un module par carrousel.
- `src/gabarits/<nom>.json` : gabarits inwink (JSON complet : itemDefinition + template + customCSS), copiés tels
  quels par `build.py` dans `dist/crsl/gabarit/`.
- `build.py` : génère `dist/crsl/` (standalone, library, gabarit, démo, README) et `dist/crsl-vX.Y.Z.zip`.
- `docs/conventions.md` : conventions partagées (structure, préfixes, contrat de gabarit, variables CSS).
- `.claude/skills/inwink-carousel/` : skill Claude pour créer ou modifier un carrousel (mouvement entre items).
- `.claude/skills/inwink-item-style/` : skill Claude pour créer ou modifier un gabarit d'item (apparence, survol).
- `CHANGELOG.md` : historique des versions.

## Commandes
```bash
python3 build.py                                                                  # construire
python3 .claude/skills/inwink-carousel/scripts/smoke_test.py dist/crsl/demo/index.html   # tester
```
Le test demande Playwright : `pip install playwright && playwright install chromium`.

**`dist/` est entièrement généré par `build.py` : ne jamais l'éditer à la main.** Toute correction se fait dans
`src/`, puis un nouveau build. `dist/crsl/` reste versionné dans le dépôt (seuls les zip et captures sont ignorés).

## Publication et releases

**`VERSION`** est une simple variable dans `build.py` (`VERSION = "1.3.1"`) : un texte source qui alimente le nom
des fichiers livrés (`crsl-v1.3.1.zip`), l'en-tête des fichiers CSS/JS et le README généré. La modifier ne fait
rien d'autre, en soi, que changer ce texte partout où `build.py` s'en sert.

**Une release** est un objet **GitHub** : une page du dépôt qui marque un point précis de l'historique avec un
**tag git** (`v1.3.1`) et des notes (reprises du `CHANGELOG.md`). C'est elle qui permet de charger une version
figée (jsDelivr, ci-dessous). Le lien entre les deux : une GitHub Action
(`.github/workflows/release.yml`) surveille les push sur `main` et crée automatiquement le tag et la release dès
qu'elle voit que `VERSION` a changé dans `build.py`. Elle ne fait que ça : elle n'incrémente rien elle-même.

### En passant par la skill Claude (`inwink-carousel` / `inwink-item-style`)
L'étape « Livrer » de la skill fait déjà, automatiquement : incrémenter `VERSION`, mettre à jour
`CHANGELOG.md`, relancer `build.py`, lancer le smoke test, et committer en local (`dist/` inclus). Il reste
**deux actions manuelles**, toujours à ta charge :
1. **Vérifier** les modifications (le résumé montré avant le commit, ou le diff du commit local).
2. **Pousser** sur `main` — en le demandant explicitement (« push »), ou en lançant `git push` toi-même. Rien
   n'est jamais poussé sans cette confirmation.

Une fois le push effectué, la GitHub Action prend le relais (tag + release) sans action supplémentaire.

### En modifiant le dépôt sans passer par Claude
Si un correctif est fait à la main (édition directe d'un fichier `src/`, ou changement fait dans un autre outil
puis reporté ici), **toutes** les étapes deviennent manuelles :
1. Éditer les fichiers dans `src/` (jamais dans `dist/`).
2. Incrémenter `VERSION` dans `build.py` (mineure pour une nouveauté, patch pour un correctif).
3. Ajouter une entrée dans `CHANGELOG.md`.
4. Relancer `python3 build.py`, puis le smoke test (commandes ci-dessus) ; vérifier les captures dans
   `dist/screens/` et que `dist/crsl/demo/index.html` reflète le changement.
5. Committer en incluant `dist/` (versionné), puis pousser sur `main`.

Sans ce dernier push, ni le tag ni la release ne sont créés, même si `VERSION` a changé en local.

### Chargement via jsDelivr
Une fois le tag créé :
- `https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.1.0/dist/crsl/library/crsl.js`
- `https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.1.0/dist/crsl/library/crsl.css`
