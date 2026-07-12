# Trading Journal App

Application complète de journal de trading, statistiques, gestion du risque et suivi comportemental — pour traders day/swing.

## 🧩 Stack technique
- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** (base de données PostgreSQL, authentification)
- **Vercel** (hébergement)

## 📦 Modules inclus
1. Profil & onboarding
2. Journal de trading (CRUD complet)
3. Statistiques (win rate, R:R, drawdown, courbe d'équité)
4. Calculateur de risque (position sizing)
5. Plan de trading & stratégies
6. Rituels quotidiens (brief matin / debrief soir)
7. Suivi comportemental (score de discipline, patterns)
8. Paramètres (profil, comptes multiples, notifications, checklist)
9. Comptes de trading multiples
10. Sécurité (RLS Supabase — chaque utilisateur ne voit que ses données)

---

## 🚀 Déploiement — étape par étape

### 1. Créer le projet Supabase
1. Allez sur [supabase.com](https://supabase.com) → **New Project**
2. Notez l'URL du projet et la clé `anon public` (Project Settings → API)
3. Allez dans **SQL Editor** → collez le contenu de `supabase/migrations/0001_initial_schema.sql` → **Run**
   - Cela crée toutes les tables, la sécurité (RLS), et le trigger de création automatique de profil

### 2. Créer le dépôt GitHub
```bash
cd trading-journal-app
git init
git add .
git commit -m "Initial commit - Trading Journal App"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/trading-journal-app.git
git push -u origin main
```

### 3. Configurer les variables d'environnement en local
```bash
cp .env.local.example .env.local
```
Puis remplissez `.env.local` avec vos vraies valeurs Supabase :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### 4. Tester en local
```bash
npm install
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) — créez un compte, testez le flux complet.

### 5. Déployer sur Vercel
1. Allez sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importez le dépôt GitHub `trading-journal-app`
3. Dans **Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**

Vercel redéploiera automatiquement à chaque `git push` sur `main`.

---

## 🔐 Sécurité
- Toutes les tables ont la **Row Level Security** activée : un utilisateur ne peut voir/modifier que ses propres données, même en cas de faille côté client.
- L'authentification passe par Supabase Auth (email + mot de passe, confirmation par email).

## 🗂️ Structure du projet
```
app/
  (app)/          → pages protégées (dashboard, journal, stats, etc.)
  login/, signup/ → authentification
components/       → composants réutilisables
lib/supabase/     → clients Supabase (navigateur + serveur)
lib/stats.ts      → fonctions de calcul (win rate, drawdown, etc.)
types/database.ts → types TypeScript du schéma
supabase/migrations/ → schéma SQL complet
middleware.ts     → protection des routes
```

## 🔜 Prochaines étapes possibles
- Export CSV/PDF des trades et statistiques
- Upload de captures d'écran de trades (Supabase Storage)
- Mode multi-comptes actif dans le journal (filtrer par compte)
- Notifications push réelles (nécessite un service worker + Web Push API)
- Calendrier économique (API externe indépendante)
