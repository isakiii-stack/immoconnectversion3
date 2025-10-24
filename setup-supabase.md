# Configuration Supabase

## 1. Exécuter le script SQL

Copiez et exécutez le contenu du fichier `frontend/supabase-setup.sql` dans l'éditeur SQL de votre projet Supabase.

## 2. Vérifier les tables créées

Les tables suivantes doivent être créées :
- `listings` - Pour les annonces immobilières
- `profiles` - Pour les profils utilisateurs
- `messages` - Pour les messages entre utilisateurs

## 3. Vérifier le bucket Storage

Le bucket `listings` doit être créé dans Storage pour stocker les images.

## 4. Vérifier les politiques RLS

Les politiques Row Level Security doivent être activées pour sécuriser l'accès aux données.
