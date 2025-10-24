# 🏠 ImmoConnect - Marketplace Immobilière Bidirectionnelle

Une plateforme web complète pour l'immobilier avec deux types d'annonces :
- **Annonces classiques** : vendeurs publient leurs biens
- **Annonces inversées** : acheteurs publient leurs recherches

## 🚀 Stack Technique

### Frontend
- **Next.js 14** + TypeScript + Tailwind CSS
- **React Query** pour la gestion d'état
- **Supabase Auth** pour l'authentification
- **Socket.IO Client** pour la messagerie temps réel

### Backend
- **Node.js** + Express + TypeScript
- **PostgreSQL** + Prisma ORM
- **Socket.IO** pour la messagerie temps réel
- **JWT** pour l'authentification
- **Multer** pour l'upload d'images

## 📁 Structure du Projet

```
immoconnect/
├── frontend/          # Application Next.js
├── backend/           # API Node.js + Express
├── shared/            # Types partagés
└── docs/              # Documentation
```

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repo-url>
cd immoconnect
```

2. **Installer les dépendances**
```bash
npm run install:all
```

3. **Configurer les variables d'environnement**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend  
cp frontend/.env.example frontend/.env.local
```

4. **Démarrer en développement**
```bash
npm run dev
```

## 🌐 URLs

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **Documentation API** : http://localhost:5000/api-docs

## 📋 Fonctionnalités

### ✅ Authentification
- [x] Inscription/Connexion
- [x] Vérification email
- [x] Profil utilisateur
- [x] Gestion des rôles

### ✅ Annonces
- [x] Annonces de vente (classiques)
- [x] Annonces d'achat (inversées)
- [x] Upload d'images
- [x] Filtres avancés
- [x] Recherche géolocalisée

### ✅ Messagerie
- [x] Chat temps réel
- [x] Conversations 1-1
- [x] Statuts de lecture
- [x] Notifications

### ✅ Dashboard
- [x] Gestion des annonces
- [x] Messages
- [x] Favoris
- [x] Statistiques

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Frontend + Backend
npm run dev:frontend     # Frontend seulement
npm run dev:backend      # Backend seulement

# Build
npm run build           # Build complet
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend
```

## 📝 TODO

- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] CI/CD Pipeline
- [ ] Monitoring
- [ ] Analytics
- [ ] PWA
- [ ] Mobile App

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
