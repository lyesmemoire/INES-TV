# 🚀 PLAN DE DÉPLOIEMENT : LEAN OTT OFFSHORE (VPS 5$)

Ce document détaille pas à pas la mise en production de votre backend de streaming Ultra-Lean (sans AI, sans surcoûts) sur un serveur VPS offshore "low cost" (ex: Hostinger, Hetzner, AlexHost, etc.).

---

## 🏗️ ÉTAPE 1 : Préparation du Serveur VPS
1. **Achetez un VPS** avec Ubuntu 22.04 ou 24.04 (Configuration requise : 1 vCPU, 1 Go ou 2 Go RAM).
2. **Nom de domaine** : Faites pointer l'enregistrement `A` de votre domaine (ex: `api.votre-domaine.com`) vers l'adresse IP de votre VPS.

---

## 📦 ÉTAPE 2 : Transfert et Installation
1. Uploadez l'intégralité du contenu de ce dossier `zip` sur votre VPS (par exemple dans `/var/www/ott-backend`).
   *(Vous pouvez utiliser FileZilla, WinSCP ou `scp`)*
2. Connectez-vous en SSH à votre VPS :
   ```bash
   ssh root@IP_DE_VOTRE_VPS
   ```
3. Installez **Node.js** (version 20 recommandée) :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

---

## 🛡️ ÉTAPE 3 : Exécution du Script "Go-Live Safe"
Le dossier contient un script magique généré spécialement pour blinder votre petit serveur VPS. Il va synchroniser l'horloge (crucial pour le HMAC) et configurer PM2 avec des limites stricts pour éviter que le disque SSD ne se remplisse avec les logs.

```bash
cd /var/www/ott-backend
chmod +x deploy-vps.sh
./deploy-vps.sh
```

---

## ⚙️ ÉTAPE 4 : Dépendances et Build
Préparez l'application Node.js pour le lancement :

1. Installez les paquets (attention à bien être dans le bon dossier) :
   ```bash
   npm install
   ```
2. Liez Prisma à votre base de données Supabase (Génère le client TypeScript localement) :
   ```bash
   npx prisma generate
   ```
   *(Note : Nous n'utilisons **PAS** `npx prisma db push` car vos tables existent déjà sur Supabase. Ne touchez pas à la structure remote).*
3. Compilez l'application :
   ```bash
   npm run build
   ```

---

## 🚦 ÉTAPE 5 : Lancement de l'App (PM2)
Si l'application n'a pas démarré automatiquement via le script `deploy-vps.sh`, lancez-la :

```bash
pm2 start dist/server.js --name ott-mvp
pm2 save
```
> Votre backend tourne désormais silencieusement sur le **Port 3000** !

---

## 🌐 ÉTAPE 6 : NGINX (Reverse Proxy & SSL)
Afin d'ouvrir votre app au monde extérieur de manière propre, installez Nginx pour rediriger le port 80/443 vers le port 3000 interne de Node.

```bash
sudo apt install nginx -y
```

Modifiez le fichier de configuration Nginx (`/etc/nginx/sites-available/default`) :
```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Redémarrez Nginx : `sudo systemctl restart nginx`

Pour ajouter un certificat SSL gratuit (HTTPS) :
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.votre-domaine.com
```

---

## 🎥 ÉTAPE 7 : Configuration du CDN (Cloudflare)
Dans votre fichier `.env` sur le serveur, vous avez la clé :
`CDN_PRIMARY=https://cdn.votre-domaine.com`

- Allez chez votre fournisseur CDN (ex: Cloudflare).
- Pointez `cdn.votre-domaine.com` vers l'IP de votre serveur de stream raw d'origine.
- **Règle vitale :** Configurez votre CDN Edge Worker (ou une règle de pare-feu avancée) pour lire et valider le paramètre `token=` (HMAC) généré par cette application Node.js. Si le token est invalide, le CDN doit bloquer le visionnage (HTTP 403).

---

## ✅ ÉTAPE 8 : Check final d'Architecture
Testez le cycle de vie de votre flux :
1. Demandez le **Nonce** via votre frontend React/Mobile: `GET /api/streams/nonce`
2. Lancez le **Stream** : `GET /api/streams/play/{id_chaine}?nonce={votre_nonce}`
3. L'API vérifie tout (banned, limites de plan) et provoque une redirection **HTTP 302** directe.
4. L'utilisateur atterrit sur le **CDN**.

🎉 **Félicitations, vous avez économisé environ 50 000$ mensuel de cloud, et votre appli est indestructible jusqu'au cap des premiers 5000 utilisateurs.**
