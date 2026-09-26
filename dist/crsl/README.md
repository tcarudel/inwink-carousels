# CRSL – carrousels pour les listes d'items inwink (v1.2.0)

## Contenu
- `standalone/crsl-<nom>/` : un CSS + un JS par carrousel (noyau inclus).
- `library/crsl.css` + `library/crsl.js` : tous les carrousels, pour les styles et scripts globaux du site.
- `gabarit/gabarit-crsl.json` : gabarit de liste d'items statiques pour la famille 2.
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
- `--crsl-card-w` : largeur des cartes (famille 1).
- `--crsl-h` : hauteur de la scène ou du carrousel.
- `--crsl-accent` : couleur d'accent (par défaut : couleur de l'item, sinon `--inwinkaccentcolor`).
- `--crsl-radius` : arrondi des scènes.
- `--crsl-bg` : fond de la galerie inclinée / du carrousel en verre.
- `--crsl-diag-bg`, `--crsl-diag-ink` : fond et texte de l'écran en diagonale.

## Points d'attention
- **Défilement au scroll** : un parent en `overflow: hidden` ou `auto` empêche l'épinglage du bloc.
- **Bandeau infini** : prévoir assez d'items pour couvrir la largeur du bloc.
- **Accessibilité** : les animations sont réduites si le visiteur a activé « réduire les animations ».

## Hébergement externe (option)
Déposer `library/` dans un dépôt GitHub, puis charger
`https://cdn.jsdelivr.net/gh/<compte>/<depot>@v1.2.0/library/crsl.js` (idem pour le CSS).
Le numéro de version dans l'URL évite les problèmes de cache lors des mises à jour.
