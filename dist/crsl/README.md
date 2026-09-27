# CRSL – carrousels pour les listes d'items inwink (v1.3.1)

## Contenu
- `standalone/crsl-<nom>/` : un CSS + un JS par carrousel (noyau inclus).
- `library/crsl.css` + `library/crsl.js` : tous les carrousels, pour les styles et scripts globaux du site.
- `gabarit/` : gabarits de liste d'items statiques (JSON, à importer dans le back-office inwink) :
  - `gabarit/gabarit-crsl.json`
  - `gabarit/produit-relief.json`
- `demo/index.html` : démo locale de tous les carrousels (double-clic pour l'ouvrir).

Les deux méthodes peuvent coexister sur une même page : le noyau ne se charge qu'une fois.

## Utilisation
1. Ajouter le CSS et le JS (standalone ou bibliothèque).
2. Mettre la liste d'items en mode d'affichage **Liste** (pas Carrousel).
3. Ajouter la classe du carrousel au bloc (et éventuellement des options).

Le nombre max d'éléments du bloc est respecté. Le réglage des colonnes n'a plus d'effet sur un bloc transformé.

## Carrousels
| Classe | Nom | Famille | Options |
|---|---|---|---|
| `crsl-vague` | Vague diagonale | 1 | molette, auto |
| `crsl-coverflow` | Coverflow 3D | 1 | molette, auto |
| `crsl-equipe` | Slider d'équipe | 1 | molette, auto |
| `crsl-focus` | Mise au point | 1 | molette, auto, compact |
| `crsl-galerie` | Galerie inclinée | 1 | molette, auto |
| `crsl-anneau` | Anneau 3D | 1 | molette |
| `crsl-pile` | Pile de cartes | 1 | auto |
| `crsl-verre` | Carrousel en verre | 1 | molette, auto |
| `crsl-bandeau` | Bandeau infini | 1 | - |
| `crsl-accordeon` | Accordéon horizontal | 1 | - |
| `crsl-defilement` | Défilement horizontal au scroll | 1 | - |
| `crsl-liste` | Liste + aperçu | 1 | - |
| `crsl-carte` | Carte qui s'agrandit | 2 | auto |
| `crsl-rideau` | Transition en rideau | 2 | auto |
| `crsl-diagonale` | Écran en diagonale | 2 | auto |
| `crsl-produit` | Produit détouré | 2 | auto |

**Famille 1** : anime les items d'origine sur place. Fonctionne avec tous les gabarits, statiques comme dynamiques
(speakers, sessions, partenaires) ; le rendu du gabarit et les boutons inwink sont conservés.

**Famille 2** : compose une scène à partir des champs de chaque item. Réservée aux listes statiques, gabarit CRSL recommandé.

## Contrat du gabarit (famille 2)
| Classe | Rôle | |
|---|---|---|
| `crsl-f-picture` | conteneur de l'image principale | obligatoire |
| `crsl-f-title` | titre (animé dans la scène, repris dans les vignettes) | obligatoire |
| `crsl-content` | tout le contenu affiché dans la scène (hors image) | obligatoire |
| `crsl-f-color` | couleur de l'item (hexa, rgb, rgba, hsl) | facultatif |
| `image-cutout` | classe conditionnelle sur l'`article` : image détourée | facultatif |

Tout ce que vous ajoutez dans `crsl-content` (texte, tag, lien, bouton…) apparaît dans la scène.
Les liens et boutons recopiés déclenchent ceux d'origine (navigation interne inwink conservée).
Les classes peuvent être combinées avec d'autres, et les clés des champs renommées librement.

## Options (classes à ajouter en plus sur le bloc)
- `crsl-opt-molette` : la molette fait défiler le carrousel quand la souris est dessus.
- `crsl-opt-auto` : défilement automatique, en pause au survol.

## Variables CSS (à définir sur le bloc)
**Ne jamais modifier `library/crsl.css` ou les fichiers standalone** pour changer une apparence : ces fichiers
restent identiques partout où la bibliothèque est utilisée. Les valeurs se définissent dans le **CSS propre à
chaque site** (celui du site, pas celui de CRSL), par exemple :
```css
:root { --crsl-radius: 4px; --crsl-accent: #123456; }   /* valeur par défaut pour tout le site */
.crsl-carte { --crsl-carte-radius: 16px; }              /* un seul carrousel, un autre site */
```
Deux sites qui chargent la même bibliothèque peuvent ainsi avoir des rendus différents sans toucher au code de
CRSL. Convention à deux niveaux : `--crsl-<classe>-<propriété>` (ex. `--crsl-carte-radius`) personnalise un seul
carrousel ; `--crsl-<propriété>` (ex. `--crsl-radius`) s'applique par défaut à tous les carrousels qui exposent
cette propriété (radius, border-width, border-color, shadow, gap, duration, accent, bg…). Sans l'une ni l'autre,
la valeur d'origine du design s'applique.

| Classe | Variables spécifiques |
|---|---|
| `crsl-vague` | --crsl-vague-card-w |
| `crsl-coverflow` | --crsl-coverflow-card-w |
| `crsl-equipe` | --crsl-equipe-card-w |
| `crsl-focus` | --crsl-focus-card-w, --crsl-focus-radius, --crsl-focus-duration |
| `crsl-galerie` | --crsl-galerie-card-w, --crsl-galerie-radius, --crsl-galerie-bg (fond), --crsl-galerie-shadow, --crsl-galerie-num-color |
| `crsl-anneau` | --crsl-anneau-card-w |
| `crsl-pile` | --crsl-pile-card-w, --crsl-pile-shadow |
| `crsl-verre` | --crsl-verre-card-w, --crsl-verre-radius, --crsl-verre-bg (fond si pas d'image), --crsl-verre-border-width, --crsl-verre-border-color, --crsl-verre-shadow |
| `crsl-bandeau` | --crsl-bandeau-card-w |
| `crsl-accordeon` | --crsl-accordeon-h (hauteur), --crsl-accordeon-radius, --crsl-accordeon-gap |
| `crsl-defilement` | --crsl-defilement-card-w, --crsl-defilement-gap, |
| `crsl-liste` | --crsl-liste-line (séparateurs), --crsl-liste-preview-w, --crsl-liste-duration, --crsl-liste-radius, --crsl-liste-shadow |
| `crsl-carte` | --crsl-carte-h, --crsl-carte-accent, --crsl-carte-radius, --crsl-carte-duration, --crsl-carte-shadow |
| `crsl-rideau` | --crsl-rideau-h, --crsl-rideau-radius |
| `crsl-diagonale` | --crsl-diagonale-h, --crsl-diagonale-accent, --crsl-diagonale-diag-bg (fond clair), --crsl-diagonale-diag-ink (texte) |
| `crsl-produit` | --crsl-produit-h, --crsl-produit-accent (fond par défaut sans couleur d'item), --crsl-produit-duration |

Variables globales communes à tous les carrousels : `--crsl-accent` (couleur d'accent, par défaut la couleur de
l'item sinon `--inwinkaccentcolor`), `--crsl-radius` (arrondi des scènes), `--crsl-h` (hauteur), `--crsl-card-w`
(largeur des cartes, famille 1), `--crsl-gap`, `--crsl-duration`, `--crsl-shadow`, `--crsl-border-width`,
`--crsl-border-color`, `--crsl-bg`.

## Points d'attention
- **Défilement au scroll** : un parent en `overflow: hidden` ou `auto` empêche l'épinglage du bloc.
- **Bandeau infini** : prévoir assez d'items pour couvrir la largeur du bloc.
- **Accessibilité** : les animations sont réduites si le visiteur a activé « réduire les animations ».

## Hébergement externe (option)
Déposer `library/` dans un dépôt GitHub, puis charger
`https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.3.1/library/crsl.js` (idem pour le CSS).
Le numéro de version dans l'URL évite les problèmes de cache lors des mises à jour.
