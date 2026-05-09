# Stress Testing GOALA TV

Pour simuler un trafic de production massif et valider la résilience des serveurs (Nginx, API, Edge Cache), installez et exécutez les commandes suivantes :

## Prérequis
```bash
npm install -g autocannon
```

## 1. Test Home (Frontend rendering & ISR Cache)
```bash
autocannon -c 100 -d 30 https://goala.com/fr
```

## 2. Test Match Page (Database & SSR/ISR resilience)
```bash
autocannon -c 100 -d 30 https://goala.com/fr/match/real-madrid-barcelone-direct
```

## 3. Test API Stream (Security & Token validation throughput)
```bash
autocannon -c 50 -d 20 https://goala.com/api/stream?id=test
```

## Monitoring de validation
Pendant les tests, surveillez les métriques serveurs avec :
```bash
htop
pm2 monit
```
Et visualisez les statistiques Node.js en live sur :
```text
https://goala.com/api/internal/runtime
```
