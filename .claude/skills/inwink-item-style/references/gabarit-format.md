# Format d'un gabarit inwink

Source de vérité pour un exemple complet : `src/gabarits/gabarit-crsl.json`. Ce document résume la structure ;
en cas de doute, relis le JSON existant plutôt que ce résumé.

## Squelette

```json
{
  "id": "<uuid>",
  "type": "itemslist",
  "customCSS": "…",
  "properties": {
    "template": { … },
    "itemDefinition": { "fields": [ … ], "languages": ["fr", "en"] },
    "items": [ … ],
    "itemsLayout": { "L": "col4", "M": "col3", "S": "col2", "XS": "col2", "XXS": "col1" },
    "itemsAlign": { "default": "center" }
  },
  "layout": null,
  "header": null
}
```

- `id` : UUID quelconque (généré une fois, sert de placeholder — inwink réattribue un id à l'import).
- `customCSS` : chaîne CSS. `##contentid` est remplacé par l'id réel du bloc (`#ct-<uuid>`) : **toujours préfixer**
  les sélecteurs avec `##contentid ` pour scoper le style au bloc.
- `itemsLayout` : nombre de colonnes par taille d'écran (`L`, `M`, `S`, `XS`, `XXS`).

## `properties.template`

- `type` : type de la racine de l'item, le plus souvent `"article"`.
- `doNotApplyLink` : `true` si aucun lien ne doit envelopper tout l'item (cas « carte avec bouton »). Omettre ou
  `false` pour le cas « tout l'item est un lien » (voir gabarit overlay).
- `conditionalClasses` : `{ "<classe>": [<condition>, …] }` — classes posées sur la racine selon la valeur d'un
  champ. Une condition est un objet `{"name": "<clé de champ>", "op": "eq"|"isempty"|…, "val": <valeur>}`.
  Utile pour une variante de mise en page ou une option de survol activable en back-office (ex. `"card-display"`
  → classe `"card"`).
- `blocs` : arbre récursif. Chaque bloc :
  - `type` : type HTML (`div`, `header`, `h3`, `h4`, `a`, `inwinkimage`…).
  - `className` : classes CSS (statiques, séparées par un espace).
  - `showIf` : liste de conditions (même format que `conditionalClasses`) — le bloc n'est rendu que si toutes
    sont vraies. Utiliser `notempty("<champ>")` par convention (voir le générateur dans l'historique de
    `build.py` avant sa suppression, ou reproduire l'équivalent : un `"not"` sur un `"or"` de `isempty`/`eq ""`/
    `eq null`).
  - `fields` : `[{"name": "<clé de champ>"}]` — insère la valeur du champ (déjà enveloppée par inwink dans
    `<span class="fieldval"><span class="fieldtext">…</span></span>` au rendu).
  - `role` : attribut ARIA/HTML (ex. `"button"` sur un `<a>`).
  - `useItemLink` : `true` pour qu'un bloc `a` utilise le lien de l'item (`$link`) sans dupliquer sa saisie.
  - `properties` : options spécifiques au type de bloc (ex. `inwinkimage` : `lazy`, `target`, `alt`, `sizes`,
    `availableSizes`, `defaultSize`).
  - `blocs` : enfants (récursif).

## `properties.itemDefinition.fields`

Chaque champ back-office :

```json
{ "key": "title", "type": "Text", "isLocalizable": true, "labels": { "fr": "Titre", "en": "Title" } }
```

Types courants :

| `type` | Usage |
|---|---|
| `picture` | image (upload back-office) |
| `Text` / `text` | texte court (`Text` localisable par convention du gabarit de référence, `text` pour un champ technique non localisé comme une couleur) |
| `multilinetext` | texte long (description) |
| `bool` | case à cocher (souvent utilisée dans `conditionalClasses`) |
| `selectlist` | liste de choix (`valuesList`, voir ci-dessous) |

- `isLocalizable` : `true` si le champ varie par langue (alors sa valeur dans `items` est `{"fr": "…", "en": "…"}`).
- `labels` : libellé affiché dans le back-office, par langue.
- `descriptions` (facultatif) : aide contextuelle affichée sous le champ dans le back-office.
- `selectlist` ajoute `valuesList` : `[{"isSelectable": true, "key": "<valeur>", "labels": {"fr": "…", "en": "…"}}]`.

Champs spéciaux déjà utilisés par les gabarits existants (à réutiliser plutôt que dupliquer) : `picture`,
`picture-cutout` (bool, image détourée), `pretitle`, `title`, `description`, `buttontitle`, `color` (texte libre :
hexa/rgb/rgba/hsl, lu par les carrousels famille 2 via `crsl-f-color`), `card-display` (bool, disposition carte),
`image-opacity` (`selectlist` : light/dark/normal), `text-position` (`selectlist` : left/center/right).

## `properties.items`

Tableau d'items de démonstration (3 à 5), mêmes clés que `itemDefinition.fields`, plus `id` (UUID) et `$link`
(`{"target": "home"}` en démo). Les champs localisables ont une valeur par langue.

## customCSS : conventions

- Scope obligatoire : `##contentid <sélecteur> { … }`.
- Effet de survol : `##contentid .itemcontent:hover .picture { … }` (ou `:focus-within` pour le clavier).
- Variables à deux niveaux pour toute propriété d'apparence exposée : voir `docs/conventions.md`, section 4, et
  `SKILL.md`, section 4.
- `##contentid .inwink-item { container-type: inline-size; }` si le style utilise des `@container` (responsive
  au niveau de l'item plutôt que du viewport).

## Contrat `crsl-f-*` (si applicable — voir `SKILL.md`, section 3)

Table complète : `docs/conventions.md`, section 3. Rappel des classes : `crsl-f-picture`, `crsl-f-title`,
`crsl-content` (obligatoires si le contrat s'applique), `crsl-f-color` (facultatif), `image-cutout` (classe
conditionnelle sur la racine).
