# ADR 002: Stratégie de protection des routes d'administration

## État
Accepté

## Contexte
Les tableaux de bord `/admin` et `/tv-os` contenaient des fonctionnalités sensibles (gestion des flux, télémétrie, statistiques financières) qui n'étaient protégées que côté client ou par des vérifications API dispersées.

## Décision
Centraliser la protection des routes d'administration au niveau du `middleware.ts` de Next.js (Edge-level protection).

### Détails de l'implémentation
- Définition d'une liste `ADMIN_PATHS` incluant `/admin` et `/tv-os`.
- Vérification du token de session Supabase (`sb-access-token`) avant tout rendu de page.
- Validation du rôle `ADMIN` dans les métadonnées de l'utilisateur.
- Utilisation de redirections 307 (Temporary Redirect) vers `/login` ou `/` selon l'état d'authentification.

## Conséquences
- **Positives** : Sécurité renforcée (impossible d'accéder au code des pages admin sans droit), centralisation de la logique d'accès.
- **Négatives** : Le middleware devient un point critique unique de défaillance (Single Point of Failure). Nécessite une surveillance des performances (latency au niveau de l'Edge).
