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
Une GitHub Action (`.github/workflows/release.yml`) crée automatiquement le tag `vX.Y.Z` et la release GitHub
(avec l'entrée correspondante du `CHANGELOG.md`) à chaque push sur `main` qui change `VERSION` dans `build.py`.
Il suffit donc d'incrémenter `VERSION`, mettre à jour `CHANGELOG.md`, committer et pousser sur `main`.

Chargement via jsDelivr, une fois le tag créé :
- `https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.1.0/dist/crsl/library/crsl.js`
- `https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.1.0/dist/crsl/library/crsl.css`
