# ADR 003: Gestion des dépendances dans les Hooks useEffect

## État
Accepté

## Contexte
Le codebase présentait de nombreux warnings `react-hooks/exhaustive-deps`, souvent masqués par des commentaires `eslint-disable`. Cela entraînait des comportements imprévisibles (stale closures) et rendait le débogage difficile.

## Décision
Adopter une politique de "Zero Warning" pour les dépendances des hooks React.

### Détails de l'implémentation
- Suppression systématique des `eslint-disable-line react-hooks/exhaustive-deps`.
- Utilisation intensive de `useCallback` pour stabiliser les fonctions de fetch passées en dépendance.
- Ajout de toutes les variables externes (tokens, ids, states) dans les tableaux de dépendances.
- Refactorisation des fonctions internes aux effets pour limiter le périmètre des dépendances.

## Conséquences
- **Positives** : Prédictibilité du comportement des composants, conformité avec les standards React, élimination de bugs subtils de rendu.
- **Négatives** : Verbosité accrue du code (plus de `useCallback`), complexité lors de la gestion de dépendances qui changent fréquemment (nécessitant parfois des refs ou des contextes plus fins).
