
# Gestion des Services Cloud

Ce projet backend permet la gestion des services cloud avec plusieurs fonctionnalités comme la gestion des réclamations, des fournisseurs, des permissions, des alertes et des factures. Il utilise Node.js, Express.js, MongoDB et l'API OVH.

## Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies Utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Utilisation](#utilisation)

## Fonctionnalités

- **Gestion des services cloud** : Création, mise à jour et suppression des services cloud.
- **Gestion des réclamations** : Suivi et résolution des réclamations des utilisateurs.
- **Gestion des fournisseurs** : Suivi des informations et des contrats des fournisseurs.
- **Gestion des permissions** : Contrôle des accès et des autorisations des utilisateurs.
- **Gestion des alertes** : Création et envoi d'alertes en cas de problèmes ou d'événements spécifiques.
- **Gestion des factures** : Création et suivi des factures.

## Technologies Utilisées

- **Node.js** : Environnement d'exécution JavaScript.
- **Express.js** : Framework web pour Node.js.
- **MongoDB** : Base de données NoSQL.
- **OVH API** : API pour gérer les services OVH.

## Installation

### Prérequis

- Node.js et npm installés
- MongoDB configuré
- Clé API OVH

### Étapes

1. Clonez le dépôt
  
   
2. Accédez au répertoire du projet
   
   cd pfeback
   
3. Installez les dépendances
   
   npm install
   
4. Configurez les variables d'environnement en créant un fichier .env à la racine du projet avec les informations suivantes :
   
env
  MONGODB_URI=your_mongodb_uri
  PASS_SEC=your_pass_sec
  JWT_SEC=your_jwt_sec
   

## Utilisation

Pour démarrer le serveur, exécutez :
npm start

Le serveur sera accessible à l'adresse http://localhost:3000.# pfe_back
