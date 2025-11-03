# HealthBridge Backend

API Backend pour le système HealthBridge.

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Démarrage en production
npm start
```

## 📁 Structure

```
src/
├── controllers/         # Contrôleurs API
├── models/             # Modèles de données MongoDB
├── routes/             # Définition des routes
├── middleware/         # Middlewares Express
├── config/             # Configuration
├── utils/              # Utilitaires
├── app.js              # Configuration Express
└── server.js           # Point d'entrée
```

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de données relationnelle
- **Sequelize** - ORM pour MySQL
- **JWT** - Authentification par tokens
- **Bcrypt** - Hachage des mots de passe
- **CORS** - Gestion des requêtes cross-origin
- **Helmet** - Sécurité HTTP
- **Express Validator** - Validation des données

## 🔧 Scripts Disponibles

- `npm start` - Démarrage en production
- `npm run dev` - Démarrage en mode développement avec nodemon
- `npm test` - Exécution des tests

## 📊 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion

### Médecins
- `GET /api/doctors` - Liste des médecins
- `POST /api/doctors` - Créer un médecin
- `PUT /api/doctors/:id` - Modifier un médecin
- `DELETE /api/doctors/:id` - Supprimer un médecin

### Patients
- `GET /api/patients` - Liste des patients
- `POST /api/patients` - Créer un patient
- `PUT /api/patients/:id` - Modifier un patient
- `DELETE /api/patients/:id` - Supprimer un patient

### Maladies
- `GET /api/diseases` - Liste des maladies
- `POST /api/diseases` - Créer une maladie
- `PUT /api/diseases/:id` - Modifier une maladie

### Études
- `GET /api/studies` - Liste des études
- `POST /api/studies` - Créer une étude
- `PUT /api/studies/:id` - Modifier une étude

### Bibliothèque
- `GET /api/library` - Liste des documents
- `POST /api/library` - Upload de document
- `GET /api/library/:id/download` - Téléchargement

### E-Learning
- `GET /api/elearning` - Liste des cours
- `POST /api/elearning` - Créer un cours
- `PUT /api/elearning/:id` - Modifier un cours

## 🔐 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection CORS
- Headers de sécurité avec Helmet
- Rate limiting
- Validation des données

## 🌍 Configuration

Variables d'environnement requises :
```env
# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=healthbridge
DB_USER=root
DB_PASSWORD=your_password

# Serveur
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🗄️ Base de données

### Installation MySQL
1. Installer MySQL sur votre système
2. Créer une base de données : `CREATE DATABASE healthbridge;`
3. Configurer les variables d'environnement

### Migration et Seeding
```bash
# Synchroniser les modèles avec la base de données
npm run db:migrate

# Remplir la base avec des données de test
npm run db:seed
```
