# CRSL – dépôt source

Carrousels pour les listes d'items inwink. Ce dépôt contient les **sources** ; les fichiers à utiliser sur le site
sont générés dans `dist/`.

## Structure
- `src/core.js`, `src/core.css` : noyau commun (détection des blocs, moteur famille 1, scène famille 2).
- `src/mods/<cle>.js` + `<cle>.css` : un module par carrousel.
- `build.py` : génère `dist/crsl/` (standalone, library, gabarit, démo, README) et `dist/crsl-vX.Y.Z.zip`.
- `.claude/skills/inwink-carousel/` : skill Claude pour créer ou modifier des carrousels.
- `CHANGELOG.md` : historique des versions.

## Commandes
```bash
python3 build.py                                                                  # construire
python3 .claude/skills/inwink-carousel/scripts/smoke_test.py dist/crsl/demo/index.html   # tester
```
Le test demande Playwright : `pip install playwright && playwright install chromium`.

## Publication via jsDelivr
Après un commit, créer un tag de version (ex. `v1.1.0`) sur GitHub, puis charger :
- `https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.1.0/dist/crsl/library/crsl.js`
- `https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.1.0/dist/crsl/library/crsl.css`

Le dossier `dist/crsl/` est donc versionné dans le dépôt (seuls les zip et captures sont ignorés).
