# Correcteur Français Simplifié ✍️✨

Un correcteur d'orthographe et de grammaire moderne et intelligent, conçu pour simplifier l'écriture en français et vous aider à peaufiner vos textes. Il gère avec aisance le "Franglais" et propose des corrections adaptées et interactives.

![Logo](logo.png)

## 🚀 Fonctionnalités

- **Correction IA Intelligente** : Analyse et corrige la grammaire, la conjugaison et l'orthographe en français.
- **Support du Franglais** : Vous pouvez mélanger le français et l'anglais, l'IA traduit et intègre les expressions de façon naturelle.
- **Interface Interactive** : Les erreurs sont surlignées. Cliquez ou survolez-les pour obtenir des explications détaillées et comprendre les corrections apportées.
- **Suggestions d'Enrichissement** : Propose des idées pour améliorer votre style, enrichir votre vocabulaire et perfectionner vos écrits.
- **Design Moderne & Réactif** : Une interface élégante en mode sombre avec des effets de glassmorphisme et des micro-animations fluides.

## 🛠️ Technologies Utilisées

- **HTML5** & **Vanilla Javascript** (Logique applicative interactive)
- **Vanilla CSS3** (Design sombre moderne, effet de flou et dégradés)
- **Modèle d'IA** (Pour l'analyse du texte et les suggestions)

## 📁 Structure du Projet

```text
├── index.html       # Structure principale de l'application web
├── style.css        # Système de design sombre et responsive
├── app.js           # Gestionnaire d'événements et logique d'analyse
└── logo.png         # Logo de l'application
```

## ⚙️ Configuration de la Clé API

Pour faire fonctionner l'application, vous devez fournir une clé API **Groq**. Deux méthodes sont disponibles :

1. **Fichier Local (`.env`)** : 
   - Créez un fichier nommé `.env` à la racine du projet.
   - Ajoutez-y votre clé comme ceci :
     ```env
     GROQ_API_KEY=votre_cle_gsk_ici
     ```
   - *Note : Le fichier `.env` est déjà présent dans le `.gitignore` afin de ne jamais l'envoyer par erreur sur GitHub.*

2. **Interface Graphique (Configuration ⚙️)** :
   - Cliquez sur l'icône d'engrenage **⚙️** en haut à droite de la page.
   - Saisissez votre clé API. Elle sera stockée de manière sécurisée localement dans votre navigateur (`localStorage`).

## 🚀 Installation et Utilisation

1. Clonez ce dépôt ou téléchargez les fichiers.
2. Assurez-vous d'avoir configuré votre clé API avec l'une des méthodes ci-dessus.
3. Ouvrez le fichier `index.html` directement dans votre navigateur (ou via un serveur de développement local comme Live Server dans VS Code).
4. Saisissez votre texte, cliquez sur **Analyser et corriger** et laissez la magie opérer !
