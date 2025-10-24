# 🚀 Guide de Déploiement ImmoConnect

## Option 1: Vercel + Supabase (Recommandé)

### 📋 Prérequis
- Compte GitHub
- Compte Vercel (gratuit)
- Compte Supabase (gratuit)

### 🔧 Étapes de déploiement

#### 1. Préparer le code
```bash
# Créer un repository GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-username/immoconnect.git
git push -u origin main
```

#### 2. Déployer sur Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer "New Project"
4. Sélectionner votre repository
5. Configurer les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SOCKET_URL`
6. Cliquer "Deploy"

#### 3. Configurer Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Exécuter le script SQL dans `frontend/supabase-setup.sql`
4. Créer le bucket Storage "listings"
5. Configurer les politiques RLS

### 🌐 URLs de test
- Frontend: `https://votre-projet.vercel.app`
- Supabase Dashboard: `https://supabase.com/dashboard`

## Option 2: Netlify + Supabase

### 🔧 Étapes
1. Aller sur [netlify.com](https://netlify.com)
2. Connecter votre repository GitHub
3. Configurer les variables d'environnement
4. Déployer

## Option 3: Railway (Full-stack)

### 🔧 Étapes
1. Aller sur [railway.app](https://railway.app)
2. Connecter GitHub
3. Déployer le backend et frontend
4. Configurer la base de données PostgreSQL

## 🔧 Configuration des variables d'environnement

### Variables requises :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
NEXT_PUBLIC_SOCKET_URL=https://votre-socket-url.com
```

## 📱 Test sur mobile
Une fois déployé, vous pourrez tester sur mobile avec l'URL HTTPS fournie par la plateforme d'hébergement.

## 🆘 Dépannage
- Vérifier les variables d'environnement
- Vérifier la configuration Supabase
- Vérifier les logs de déploiement
