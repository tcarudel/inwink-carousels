# Historique

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
