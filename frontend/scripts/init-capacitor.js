#!/usr/bin/env node

/**
 * Script pour initialiser Capacitor
 * Ce script configure Capacitor pour ImmoConnect
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Initialisation de Capacitor pour ImmoConnect...\n');

// Vérifier que capacitor.config.json existe
const configPath = path.join(__dirname, '..', 'capacitor.config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ capacitor.config.json non trouvé!');
  process.exit(1);
}

// Lire la config
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📋 Configuration actuelle:');
console.log(`   App ID: ${config.appId}`);
console.log(`   App Name: ${config.appName}`);
console.log(`   Web Dir: ${config.webDir}\n`);

// Vérifier si Android est déjà ajouté
const androidPath = path.join(__dirname, '..', 'android');
if (fs.existsSync(androidPath)) {
  console.log('✅ Plateforme Android déjà ajoutée\n');
} else {
  console.log('📱 Ajout de la plateforme Android...');
  try {
    execSync('npx cap add android', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit' 
    });
    console.log('✅ Plateforme Android ajoutée!\n');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la plateforme Android');
    console.error(error.message);
    process.exit(1);
  }
}

console.log('✅ Capacitor initialisé avec succès!');
console.log('\n📝 Prochaines étapes:');
console.log('   1. Build Next.js pour Capacitor: npm run build:capacitor');
console.log('   2. Synchroniser: npm run cap:sync');
console.log('   3. Ouvrir Android Studio: npm run cap:open:android');
console.log('   4. Dans Android Studio: Build → Build APK\n');


