# Billed

Projet n°9 du [parcours Développeur d'Application - JavaScript React](https://openclassrooms.com/fr/paths/516-developpeur-dapplication-javascript-react) d'OpenClassrooms : _Débuggez et testez un SaaS RH_.

> Pour ce projet, on intègre la feature team "note de frais" de Billed, une entreprise qui produit des solutions Saas destinées aux équipes de ressources humaines. On nous demande de débugger le parcours administrateur puis de tester et débugger le parcours employé.

## 📚 Technologie utilisées

- JavaScript
- Jest

## 📦 Installation

### 🧰 Prérequis

Pour lancer le projet, vous devez avoir les programmes suivants installés sur votre machine :

- NodeJS

### 🔧 Installation et démarrage de l'API

Dans le dossier **back**, avec le terminal, exécutez la commande suivante pour installer les packages requis pour le fonctionnement du backend :

```
npm install
```

Enfin, exécutez la commande suivante pour démarrer l'API :

```
npm run run:dev
```

L'API est accessible sur le port `5678` en local, c'est à dire `http://localhost:5678`.
Si tout se passe bien, le message suivant devrait s'afficher dans le terminal :

```
billapp-backend@1.0.0 run:dev
NODE_ENV=development sequelize-cli db:migrate && node server.js
```

### 🖥️ Installation de l'application Frontend

Dans le dossier **front**, avec le terminal, exécutez la commande suivante pour installer les packages requis pour le fonctionnement du frontend de l'application :

```
npm install
```

Puis, exécutez la commande suivante pour installer le package `live-server` :

```
npm install -g live-server
```

Ensuite, exécutez la commande suivante pour démarrer l'application :

```
live-server
```

Par défaut, l'application est accessible à l'adresse `http://127.0.0.1:8080/`

### 👥 Comptes et utilisateurs

Vous pouvez vous connecter en utilisant les comptes:

```
Utilisateur : admin@test.tld
Mot de passe : admin
```

ou

```
Utilisateur : employee@test.tld
Mot de passe : employee
```
