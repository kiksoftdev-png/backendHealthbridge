# Documentation API HealthBridge

## Base URL
```
http://localhost:5001/api
```
ou en production:
```
https://backendhealthbridge.onrender.com/api
```

## Authentification

La plupart des endpoints nécessitent un token JWT dans le header Authorization:
```
Authorization: Bearer <token>
```

---

## 🔐 Endpoints d'Authentification (`/api/auth`)

### POST `/api/auth/register`
Inscription d'un nouvel utilisateur (médecin ou patient).

**Body:**
```json
{
  "name": "string (requis)",
  "email": "string (requis, unique)",
  "password": "string (requis, min 6 caractères)",
  "phone": "string (optionnel)",
  "role": "doctor | patient (défaut: patient)",
  
  // Pour les médecins (role: "doctor")
  "specialty": "string (requis pour doctor)",
  "hospital": "string (optionnel)",
  "zone": "string (optionnel)",
  "licenseNumber": "string (optionnel)",
  
  // Pour les patients (role: "patient")
  "age": "number (requis pour patient)",
  "gender": "M | F | Other (requis pour patient)"
}
```

**Réponse succès (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Jean Dupont",
      "email": "jean@example.com",
      "role": "doctor",
      "phone": "+243 81 000 0000",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Réponse erreur (400):**
```json
{
  "success": false,
  "message": "Un utilisateur avec cet email existe déjà"
}
```

---

### POST `/api/auth/login`
Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "string (requis)",
  "password": "string (requis)"
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Jean Dupont",
      "email": "jean@example.com",
      "role": "doctor",
      "phone": "+243 81 000 0000",
      "isActive": true,
      "isOnline": true,
      "lastLogin": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Réponse erreur (401):**
```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

---

### GET `/api/auth/profile`
Récupérer le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Jean Dupont",
    "email": "jean@example.com",
    "role": "doctor",
    "phone": "+243 81 000 0000",
    "avatar": "url",
    "isActive": true,
    "isOnline": true,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### POST `/api/auth/logout`
Déconnexion de l'utilisateur.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### POST `/api/auth/online`
Marquer l'utilisateur comme en ligne.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Statut en ligne mis à jour"
}
```

---

### POST `/api/auth/offline`
Marquer l'utilisateur comme hors ligne.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Statut hors ligne mis à jour"
}
```

---

### GET `/api/auth/online-users`
Récupérer la liste des utilisateurs en ligne.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. Jean Dupont",
      "email": "jean@example.com",
      "role": "doctor",
      "isOnline": true,
      "lastActiveAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET `/api/auth/all-users`
Récupérer tous les utilisateurs.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. Jean Dupont",
      "email": "jean@example.com",
      "role": "doctor",
      "isOnline": true
    }
  ]
}
```

---

## 👨‍⚕️ Endpoints Médecins (`/api/doctors`)

### GET `/api/doctors`
Récupérer tous les médecins.

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 10,
        "name": "Dr. Jean Dupont",
        "email": "jean@example.com",
        "phone": "+243 81 000 0000",
        "avatar": "url",
        "isActive": true
      },
      "specialty": "Cardiologie",
      "hospital": "Hôpital Central",
      "zone": "Kinshasa",
      "experience": "10 ans",
      "rating": 4.5,
      "isOnline": true,
      "licenseNumber": "MD12345"
    }
  ],
  "count": 1
}
```

---

### GET `/api/doctors/:id`
Récupérer un médecin par ID.

**Paramètres:**
- `id` (path): ID du médecin

**Réponse succès (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user": { ... },
    "specialty": "Cardiologie",
    ...
  }
}
```

---

### POST `/api/doctors`
Créer un nouveau médecin.

**Body:**
```json
{
  "name": "string (requis)",
  "email": "string (requis)",
  "password": "string (requis)",
  "phone": "string (optionnel)",
  "specialty": "string (requis)",
  "hospital": "string (optionnel)",
  "zone": "string (optionnel)",
  "experience": "string (optionnel)",
  "licenseNumber": "string (optionnel)",
  "qualifications": "string (optionnel)",
  "languages": ["string"] (optionnel)
}
```

**Réponse succès (201):**
```json
{
  "success": true,
  "message": "Médecin créé avec succès",
  "data": { ... }
}
```

---

### PUT `/api/doctors/:id`
Mettre à jour un médecin.

**Body:** (champs optionnels à mettre à jour)

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Médecin mis à jour avec succès",
  "data": { ... }
}
```

---

### DELETE `/api/doctors/:id`
Supprimer un médecin.

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Médecin supprimé avec succès"
}
```

---

## 👥 Endpoints Patients (`/api/patients`)

### GET `/api/patients`
Récupérer tous les patients.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `doctorId` (optionnel): Filtrer les patients par ID du docteur assigné

**Exemple:**
```
GET /api/patients?doctorId=5
```

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "name": "Marie Dupont",
        "email": "marie@example.com",
        "phone": "+243 81 000 0000",
        "avatar": "url",
        "isActive": true
      },
      "age": 35,
      "gender": "F",
      "bloodType": "A+",
      "emergencyContact": "Jean Dupont",
      "emergencyPhone": "+243 81 111 1111",
      "medicalHistory": "Aucun",
      "allergies": "Aucune",
      "currentMedications": "Aucun",
      "insuranceNumber": "INS12345"
    }
  ],
  "count": 1
}
```

---

### GET `/api/patients/doctor/:doctorId`
Récupérer tous les patients assignés à un docteur spécifique.

**Headers:**
```
Authorization: Bearer <token>
```

**Paramètres:**
- `doctorId` (path): ID du docteur

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "name": "Marie Dupont",
        "email": "marie@example.com",
        "phone": "+243 81 000 0000",
        "avatar": "url",
        "isActive": true
      },
      "age": 35,
      "gender": "F",
      "bloodType": "A+",
      "emergencyContact": "Jean Dupont",
      "emergencyPhone": "+243 81 111 1111",
      "medicalHistory": "Aucun",
      "allergies": "Aucune",
      "currentMedications": "Aucun",
      "insuranceNumber": "INS12345",
      "assignedDoctorId": 10,
      "status": "Stable",
      "diagnosis": "En cours d'évaluation",
      "doctor": "Dr. Non assigné",
      "lastVisit": "15/01/2024"
    }
  ],
  "count": 1
}
```

**Réponse erreur (400):**
```json
{
  "success": false,
  "message": "ID du docteur requis"
}
```

---

### GET `/api/patients/:id`
Récupérer un patient par ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Paramètres:**
- `id` (path): ID du patient

---

### POST `/api/patients`
Créer un nouveau patient.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "string (requis)",
  "email": "string (requis)",
  "phone": "string (requis)",
  "password": "string (optionnel, défaut: changeme123)",
  "age": "number (requis)",
  "gender": "M | F | Other (requis)",
  "bloodType": "A+ | A- | B+ | B- | AB+ | AB- | O+ | O- (optionnel)",
  "emergencyContact": "string (optionnel)",
  "emergencyPhone": "string (optionnel)",
  "medicalHistory": "string (optionnel)",
  "allergies": "string (optionnel)",
  "currentMedications": "string (optionnel)",
  "insuranceNumber": "string (optionnel)"
}
```

**Note:** Le champ `assignedDoctorId` est automatiquement rempli avec l'ID du médecin connecté lors de la création.

**Réponse succès (201):**
```json
{
  "success": true,
  "message": "Patient créé avec succès",
  "data": { ... }
}
```

---

### PUT `/api/patients/:id`
Mettre à jour un patient.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (champs optionnels à mettre à jour)

---

### DELETE `/api/patients/:id`
Supprimer un patient.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 🏥 Endpoints Consultations (`/api/consultations`)

### GET `/api/consultations`
Récupérer toutes les consultations.

**Query Parameters:**
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 10)
- `search` (optionnel): Recherche par nom patient/médecin
- `status` (optionnel): Filtrer par statut
- `priority` (optionnel): Filtrer par priorité
- `doctorId` (optionnel): Filtrer par médecin
- `patientId` (optionnel): Filtrer par patient

**Exemple:**
```
GET /api/consultations?page=1&limit=20&doctorId=5
```

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patient": { ... },
      "doctor": { ... },
      "hospital": { ... },
      "consultationDate": "2024-01-15T10:00:00.000Z",
      "chiefComplaint": "Douleur thoracique",
      "diagnosis": "Angine de poitrine",
      "status": "Terminée",
      "priority": "Urgente",
      "notes": "Notes de consultation",
      "prescriptions": []
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### GET `/api/consultations/:id`
Récupérer une consultation par ID.

---

### POST `/api/consultations`
Créer une nouvelle consultation.

**Body:**
```json
{
  "patientId": "number (requis)",
  "doctorId": "number (requis)",
  "hospitalId": "number (optionnel)",
  "consultationDate": "ISO date string (requis)",
  "chiefComplaint": "string (optionnel)",
  "diagnosis": "string (optionnel)",
  "status": "En attente | En cours | Terminée | Annulée | Reportée (optionnel)",
  "priority": "Urgente | Élevée | Normale | Faible (optionnel)",
  "notes": "string (optionnel)"
}
```

---

### PUT `/api/consultations/:id`
Mettre à jour une consultation.

---

### DELETE `/api/consultations/:id`
Supprimer une consultation.

---

## 💊 Endpoints Prescriptions (`/api/prescriptions`)

### GET `/api/prescriptions/consultation/:consultationId`
Récupérer toutes les prescriptions d'une consultation.

**Paramètres:**
- `consultationId` (path): ID de la consultation

---

### GET `/api/prescriptions/:id`
Récupérer une prescription par ID.

---

### POST `/api/prescriptions`
Créer une nouvelle prescription.

**Body:**
```json
{
  "consultationId": "number (requis)",
  "medicamentId": "number (requis)",
  "dosage": "string (requis)",
  "frequency": "string (requis)",
  "duration": "string (requis)",
  "instructions": "string (optionnel)"
}
```

---

### PUT `/api/prescriptions/:id`
Mettre à jour une prescription.

---

### DELETE `/api/prescriptions/:id`
Supprimer une prescription.

---

## 💉 Endpoints Médicaments (`/api/medicaments`)

### GET `/api/medicaments`
Récupérer tous les médicaments.

**Query Parameters:**
- `page`, `limit`, `search` (optionnels)

---

### GET `/api/medicaments/stats`
Récupérer les statistiques des médicaments.

---

### GET `/api/medicaments/:id`
Récupérer un médicament par ID.

---

### POST `/api/medicaments`
Créer un nouveau médicament.

**Body:**
```json
{
  "name": "string (requis)",
  "genericName": "string (optionnel)",
  "category": "string (optionnel)",
  "dosage": "string (optionnel)",
  "form": "string (optionnel)",
  "manufacturer": "string (optionnel)",
  "price": "number (optionnel)",
  "stock": "number (optionnel)",
  "description": "string (optionnel)"
}
```

---

### PUT `/api/medicaments/:id`
Mettre à jour un médicament.

---

### DELETE `/api/medicaments/:id`
Supprimer un médicament.

---

## 🦠 Endpoints Maladies (`/api/diseases`)

### GET `/api/diseases`
Récupérer toutes les maladies.

**Headers:**
```
Authorization: Bearer <token>
```

---

### GET `/api/diseases/:id`
Récupérer une maladie par ID.

**Headers:**
```
Authorization: Bearer <token>
```

---

### POST `/api/diseases`
Créer une nouvelle maladie.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "string (requis)",
  "description": "string (optionnel)",
  "symptoms": "string (optionnel)",
  "treatment": "string (optionnel)",
  "prevalence": "string (optionnel)",
  "zone": "string (optionnel)",
  "severity": "string (optionnel)"
}
```

---

### PUT `/api/diseases/:id`
Mettre à jour une maladie.

**Headers:**
```
Authorization: Bearer <token>
```

---

### DELETE `/api/diseases/:id`
Supprimer une maladie.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 📚 Endpoints Études (`/api/studies`)

### GET `/api/studies`
Récupérer toutes les études.

**Headers:**
```
Authorization: Bearer <token>
```

---

### GET `/api/studies/:id`
Récupérer une étude par ID.

**Headers:**
```
Authorization: Bearer <token>
```

---

### POST `/api/studies`
Créer une nouvelle étude.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "string (requis, 5-300 caractères)",
  "description": "string (optionnel, max 1000)",
  "researcherId": "number (requis)",
  "zone": "string (requis, 2-100 caractères)",
  "startDate": "ISO date string (requis)",
  "endDate": "ISO date string (optionnel)",
  "status": "Planifiée | En cours | Terminée | Annulée (requis)",
  "participants": "number (requis, min 0)",
  "studyType": "Observationnelle | Expérimentale | Épidémiologique | Clinique (requis)",
  "objectives": "string (optionnel, max 1000)",
  "methodology": "string (optionnel, max 1000)",
  "funding": "string (optionnel, max 200)",
  "ethicsApproval": "boolean (optionnel)"
}
```

---

### PUT `/api/studies/:id`
Mettre à jour une étude.

**Headers:**
```
Authorization: Bearer <token>
```

---

### DELETE `/api/studies/:id`
Supprimer une étude.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 🏥 Endpoints Hôpitaux (`/api/hospitals`)

### GET `/api/hospitals`
Récupérer tous les hôpitaux.

**Query Parameters:**
- `page`, `limit`, `search` (optionnels)

---

### GET `/api/hospitals/stats`
Récupérer les statistiques des hôpitaux.

---

### GET `/api/hospitals/:id`
Récupérer un hôpital par ID.

---

### POST `/api/hospitals`
Créer un nouvel hôpital.

**Body:**
```json
{
  "name": "string (requis)",
  "address": "string (optionnel)",
  "phone": "string (optionnel)",
  "email": "string (optionnel)",
  "type": "string (optionnel)",
  "capacity": "number (optionnel)",
  "zone": "string (optionnel)"
}
```

---

### PUT `/api/hospitals/:id`
Mettre à jour un hôpital.

---

### DELETE `/api/hospitals/:id`
Supprimer un hôpital.

---

## 🗺️ Endpoints Zones de Santé (`/api/health-zones`)

### GET `/api/health-zones`
Récupérer toutes les zones de santé.

**Query Parameters:**
- `page`, `limit`, `search`, `province` (optionnels)

---

### GET `/api/health-zones/stats`
Récupérer les statistiques des zones de santé.

---

### GET `/api/health-zones/:id`
Récupérer une zone de santé par ID.

---

### POST `/api/health-zones`
Créer une nouvelle zone de santé.

**Body:**
```json
{
  "name": "string (requis)",
  "code": "string (requis)",
  "province": "string (requis)",
  "population": "number (optionnel)",
  "area": "number (optionnel)",
  "description": "string (optionnel)"
}
```

---

### POST `/api/health-zones/generate-pdf`
Générer un PDF détaillé pour une zone de santé.

**Body:**
```json
{
  "zoneId": "number (requis)"
}
```

---

### PUT `/api/health-zones/:id`
Mettre à jour une zone de santé.

---

### DELETE `/api/health-zones/:id`
Supprimer une zone de santé.

---

## 💬 Endpoints Messages (`/api/messages`)

### GET `/api/messages/conversations`
Récupérer toutes les conversations de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": 5,
      "user": {
        "id": 5,
        "name": "Dr. Jean Dupont",
        "email": "jean@example.com",
        "avatar": "url",
        "isOnline": true
      },
      "lastMessage": {
        "id": 10,
        "content": "Bonjour",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "unreadCount": 2
    }
  ]
}
```

---

### GET `/api/messages/:userId`
Récupérer les messages avec un utilisateur spécifique.

**Headers:**
```
Authorization: Bearer <token>
```

**Paramètres:**
- `userId` (path): ID de l'utilisateur avec qui on veut les messages

**Query Parameters:**
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 50)

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "senderId": 5,
      "receiverId": 10,
      "content": "Bonjour",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "sender": {
        "id": 5,
        "name": "Dr. Jean Dupont",
        "email": "jean@example.com"
      },
      "receiver": {
        "id": 10,
        "name": "Marie Dupont",
        "email": "marie@example.com"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

---

### POST `/api/messages/send`
Envoyer un message.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "receiverId": "number (requis)",
  "content": "string (requis)"
}
```

**Réponse succès (201):**
```json
{
  "success": true,
  "message": "Message envoyé",
  "data": {
    "id": 1,
    "senderId": 5,
    "receiverId": 10,
    "content": "Bonjour",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### POST `/api/messages/archive`
Archiver les messages anciens (plus de 30 jours).

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "150 messages archivés",
  "count": 150
}
```

---

## 📊 Endpoints Activités (`/api/activities`)

### GET `/api/activities`
Récupérer toutes les activités.

**Query Parameters:**
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 50)
- `action` (optionnel): Filtrer par action (CREATE, UPDATE, DELETE, VIEW, etc.)
- `entityType` (optionnel): Filtrer par type d'entité (Patient, Doctor, Consultation, etc.)
- `userId` (optionnel): Filtrer par utilisateur

**Exemple:**
```
GET /api/activities?page=1&limit=10&entityType=Patient&action=CREATE
```

**Réponse succès (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 5,
      "action": "CREATE",
      "entityType": "Patient",
      "entityId": 10,
      "entityName": "Marie Dupont",
      "description": "Nouveau patient créé: Marie Dupont",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": 5,
        "name": "Dr. Jean Dupont",
        "email": "jean@example.com",
        "role": "doctor"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

### POST `/api/activities`
Créer une activité manuellement (pour cas spécifiques).

**Body:**
```json
{
  "action": "string (requis)",
  "entityType": "string (requis)",
  "entityId": "number (optionnel)",
  "entityName": "string (optionnel)",
  "description": "string (optionnel)"
}
```

---

### POST `/api/activities/download`
Enregistrer un téléchargement.

**Body:**
```json
{
  "documentType": "string (requis)",
  "fileName": "string (requis)"
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Téléchargement enregistré"
}
```

---

## 🏥 Endpoint Health Check

### GET `/api/health`
Vérifier l'état de l'API.

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "HealthBridge API est opérationnelle",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Codes de Statut HTTP

- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non autorisé (token manquant ou invalide)
- `403` - Accès refusé (permissions insuffisantes)
- `404` - Ressource non trouvée
- `500` - Erreur serveur interne

---

## Format des Erreurs

Toutes les erreurs suivent ce format:

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "Détails techniques (en développement uniquement)"
}
```

---

## Notes Importantes

1. **Authentification**: La plupart des endpoints nécessitent un token JWT valide dans le header `Authorization: Bearer <token>`

2. **Pagination**: Les endpoints de liste supportent généralement la pagination avec `page` et `limit`

3. **Filtrage**: Beaucoup d'endpoints supportent des paramètres de recherche et filtrage via query parameters

4. **Validation**: Les données sont validées côté serveur avant traitement

5. **Rôles**: Certaines actions peuvent être restreintes selon le rôle de l'utilisateur (admin, doctor, patient)

6. **CORS**: L'API autorise les requêtes depuis toutes les origines en développement

7. **Rate Limiting**: Activé en production (100 requêtes par IP toutes les 15 minutes)

---

## Exemples d'Utilisation

### Exemple 1: Connexion
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@example.com",
    "password": "password123"
  }'
```

### Exemple 2: Récupérer les patients (avec authentification)
```bash
curl -X GET http://localhost:5001/api/patients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Exemple 3: Créer une consultation
```bash
curl -X POST http://localhost:5001/api/consultations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 5,
    "doctorId": 10,
    "consultationDate": "2024-01-20T10:00:00.000Z",
    "chiefComplaint": "Douleur thoracique",
    "status": "En attente",
    "priority": "Urgente"
  }'
```

---

## Support

Pour toute question ou problème, contactez l'équipe de développement.

**Version de l'API:** 1.0.0  
**Dernière mise à jour:** 2024-01-15

