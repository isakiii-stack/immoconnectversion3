# Configuration Storage Supabase

## 🖼️ Créer le bucket pour les images

1. Allez dans votre projet Supabase
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur **Buckets**
4. Cliquez sur **New bucket**
5. Configurez :
   - **Name** : `listings`
   - **Public bucket** : ✅ Activé (cochez cette case)
6. Cliquez sur **Create bucket**

## 🔒 Politiques de sécurité

Après avoir créé le bucket, ajoutez ces politiques dans **Storage** → **Policies** :

```sql
-- Politique pour permettre la lecture publique
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'listings');

-- Politique pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour par le propriétaire
CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour permettre la suppression par le propriétaire
CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## ✅ Vérification

Une fois configuré, vous devriez voir :
- Le bucket `listings` dans la liste des buckets
- Les politiques de sécurité activées
- L'accès public activé
