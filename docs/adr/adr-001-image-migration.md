# ADR 001: Migration des balises <img> vers next/image

## État
Accepté

## Contexte
L'application INES TV utilisait des balises `<img>` natives pour l'affichage des logos de chaînes, des miniatures et des bannières publicitaires. Cela entraînait des performances sous-optimales (LCP élevé, chargement d'images non redimensionnées) et des warnings de production lors du build Next.js.

## Décision
Nous avons décidé de migrer systématiquement toutes les balises `<img>` vers le composant `<Image />` de Next.js.

### Détails de l'implémentation
- Utilisation de la propriété `fill` combinée à un conteneur parent en `position: relative` pour maintenir la flexibilité du layout.
- Application de `object-fit: contain` ou `cover` selon le contexte visuel original.
- Configuration de `remotePatterns` dans `next.config.cjs` pour autoriser tous les domaines externes (`**`).
- Ajout systématique de placeholders (`/placeholder.png`) pour éviter les erreurs de type `undefined`.

## Conséquences
- **Positives** : Optimisation automatique des formats (WebP/AVIF), réduction de la bande passante, amélioration du Score Core Web Vitals (LCP).
- **Négatives** : Nécessité de gérer explicitement les dimensions des conteneurs parents et les fallbacks d'URL.
