# Guide de Contribution - ImmoConnect

Merci de votre intérêt pour contribuer à ImmoConnect ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 13+
- Git

### Installation
```bash
# Cloner le repository
git clone https://github.com/yourusername/immoconnect.git
cd immoconnect

# Installer les dépendances
npm run install:all

# Configurer les variables d'environnement
cp frontend/env.example frontend/.env.local
cp backend/env.example backend/.env

# Démarrer en développement
npm run dev
```

## 📋 Types de Contributions

### 🐛 Bug Reports
- Utilisez le template de bug report
- Incluez des étapes pour reproduire le bug
- Ajoutez des captures d'écran si nécessaire
- Spécifiez votre environnement (OS, navigateur, version Node.js)

### ✨ Feature Requests
- Utilisez le template de feature request
- Décrivez clairement la fonctionnalité souhaitée
- Expliquez pourquoi cette fonctionnalité serait utile
- Proposez une solution si possible

### 🔧 Pull Requests
- Créez une branche feature à partir de `main`
- Suivez les conventions de nommage
- Ajoutez des tests si nécessaire
- Mettez à jour la documentation

## 🏗️ Architecture du Projet

```
immoconnect/
├── frontend/          # Application Next.js
│   ├── src/
│   │   ├── app/      # Pages et layouts
│   │   ├── components/ # Composants réutilisables
│   │   ├── hooks/    # Hooks personnalisés
│   │   ├── lib/      # Utilitaires
│   │   └── types/    # Types TypeScript
├── backend/          # API Node.js
│   ├── src/
│   │   ├── controllers/ # Contrôleurs
│   │   ├── middleware/  # Middlewares
│   │   ├── routes/     # Routes API
│   │   ├── services/   # Services métier
│   │   └── utils/      # Utilitaires
├── docs/             # Documentation
└── scripts/          # Scripts d'aide
```

## 🎯 Standards de Code

### TypeScript
- Utilisez des types stricts
- Évitez `any` autant que possible
- Documentez les interfaces complexes
- Utilisez les enums pour les constantes

### React/Next.js
- Utilisez des composants fonctionnels
- Préférez les hooks aux classes
- Utilisez `useCallback` et `useMemo` quand nécessaire
- Suivez les conventions de nommage des composants

### Node.js/Express
- Utilisez async/await
- Gérez les erreurs proprement
- Validez les entrées utilisateur
- Utilisez des middlewares appropriés

### Base de données
- Utilisez Prisma ORM
- Créez des migrations pour les changements de schéma
- Indexez les colonnes fréquemment utilisées
- Utilisez des transactions pour les opérations complexes

## 🧪 Tests

### Frontend
```bash
cd frontend
npm run test
npm run test:watch
npm run test:coverage
```

### Backend
```bash
cd backend
npm run test
npm run test:watch
npm run test:coverage
```

### Tests E2E
```bash
npm run test:e2e
```

## 📝 Documentation

### Code
- Commentez les fonctions complexes
- Utilisez JSDoc pour les fonctions publiques
- Documentez les APIs avec des exemples

### README
- Mettez à jour le README principal
- Ajoutez des exemples d'utilisation
- Documentez les nouvelles fonctionnalités

### API
- Documentez les nouveaux endpoints
- Ajoutez des exemples de requêtes/réponses
- Mettez à jour la documentation OpenAPI

## 🔄 Workflow de Contribution

### 1. Fork et Clone
```bash
# Fork le repository sur GitHub
# Puis cloner votre fork
git clone https://github.com/votreusername/immoconnect.git
cd immoconnect
```

### 2. Configuration
```bash
# Ajouter le repository original comme remote
git remote add upstream https://github.com/original/immoconnect.git

# Créer une branche pour votre feature
git checkout -b feature/ma-nouvelle-feature
```

### 3. Développement
```bash
# Faire vos modifications
# Tester vos changements
npm run test
npm run lint

# Commiter vos changements
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"
```

### 4. Push et Pull Request
```bash
# Pousser votre branche
git push origin feature/ma-nouvelle-feature

# Créer une Pull Request sur GitHub
```

## 📋 Checklist Pull Request

- [ ] Code testé et fonctionnel
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de conflits avec la branche main
- [ ] Messages de commit clairs
- [ ] Code review effectué
- [ ] Linting passé sans erreurs

## 🏷️ Convention de Nommage

### Branches
- `feature/nom-de-la-feature`
- `bugfix/nom-du-bug`
- `hotfix/nom-du-hotfix`
- `docs/nom-de-la-documentation`

### Commits
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage
- `refactor:` refactoring
- `test:` tests
- `chore:` maintenance

### Composants
- PascalCase pour les composants React
- camelCase pour les fonctions et variables
- UPPER_CASE pour les constantes

## 🐛 Débogage

### Frontend
```bash
# Mode debug
npm run dev:debug

# Vérifier les erreurs de build
npm run build
```

### Backend
```bash
# Mode debug
npm run dev:debug

# Vérifier les logs
tail -f logs/combined.log
```

### Base de données
```bash
# Se connecter à la base
npx prisma studio

# Vérifier les migrations
npm run db:status
```

## 🔒 Sécurité

### Signaler des vulnérabilités
- Ne créez pas d'issue publique
- Contactez-nous directement à security@immoconnect.com
- Incluez des détails sur la vulnérabilité
- Attendez notre réponse avant de divulguer

### Bonnes pratiques
- Validez toutes les entrées utilisateur
- Utilisez des requêtes préparées
- Gérez les erreurs sans exposer d'informations sensibles
- Mettez à jour régulièrement les dépendances

## 📞 Support

### Questions générales
- Créez une issue avec le label `question`
- Utilisez le template de question
- Fournissez le contexte nécessaire

### Problèmes techniques
- Créez une issue avec le label `bug`
- Incluez les logs d'erreur
- Spécifiez votre environnement

### Nouvelles fonctionnalités
- Créez une issue avec le label `enhancement`
- Décrivez clairement la fonctionnalité
- Expliquez le cas d'usage

## 🎉 Reconnaissance

Les contributeurs seront mentionnés dans :
- Le fichier CONTRIBUTORS.md
- Les release notes
- La documentation du projet

## 📄 Licence

En contribuant à ImmoConnect, vous acceptez que vos contributions soient sous la même licence que le projet (MIT).

---

Merci de contribuer à ImmoConnect ! 🚀
