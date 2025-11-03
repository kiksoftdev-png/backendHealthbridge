# Guide du Système de Journal des Activités (Activity Logging)

## Vue d'ensemble

Le système de journal des activités enregistre automatiquement toutes les actions effectuées sur la plateforme HealthBridge, créant un audit trail complet.

## Actions enregistrées

### ✅ Déjà implémenté

1. **Authentification** (`authController.js`)
   - ✅ Connexion (LOGIN)
   - ✅ Déconnexion (LOGOUT)

2. **Consultations** (`consultationsController.js`)
   - ✅ Création (CREATE)
   - ✅ Mise à jour (UPDATE)
   - ✅ Suppression (DELETE)

3. **Prescriptions** (`prescriptionsController.js`)
   - ✅ Création (CREATE)
   - ✅ Suppression (DELETE)

4. **Téléchargements PDF** (`PatientsList.js`)
   - ✅ Export de listes (DOWNLOAD)

### 📝 À implémenter (exemples pour les autres contrôleurs)

## Utilisation du ActivityLogger

### Exemple 1: Création

```javascript
const ActivityLogger = require('../services/activityLogger');

// Dans un contrôleur
const createMedicament = async (req, res) => {
  const medicament = await Medicament.create(req.body);
  
  // Enregistrer l'activité
  await ActivityLogger.logCreate(
    'Medicament',
    medicament,
    req.user?.id,
    { manufacturer: medicament.manufacturer }
  );
  
  res.json({ success: true, data: medicament });
};
```

### Exemple 2: Mise à jour

```javascript
const updateMedicament = async (req, res) => {
  const medicament = await Medicament.findByPk(id);
  const oldData = { ...medicament.toJSON() };
  
  await medicament.update(req.body);
  
  // Enregistrer l'activité
  await ActivityLogger.logUpdate(
    'Medicament',
    id,
    oldData,
    { ...oldData, ...req.body },
    req.user?.id
  );
  
  res.json({ success: true, data: medicament });
};
```

### Exemple 3: Suppression

```javascript
const deleteMedicament = async (req, res) => {
  const medicament = await Medicament.findByPk(id);
  
  // Enregistrer l'activité
  await ActivityLogger.logDelete(
    'Medicament',
    id,
    medicament.name,
    req.user?.id
  );
  
  await medicament.destroy();
  res.json({ success: true });
};
```

### Exemple 4: Téléchargement PDF (frontend)

```javascript
// Dans un composant React
import apiService from '../../services/api';

const exportToPDF = async () => {
  // ... créer le PDF
  const fileName = `document-${Date.now()}.pdf`;
  doc.save(fileName);
  
  // Enregistrer l'activité
  try {
    await apiService.logDownload('Type de document', fileName);
  } catch (err) {
    console.error('Erreur:', err);
  }
};
```

## Structure des activités enregistrées

Chaque activité contient :

```javascript
{
  userId: 1,                    // ID de l'utilisateur
  action: 'CREATE',             // Type d'action
  entityType: 'Patient',        // Type d'entité
  entityId: 123,                // ID de l'entité
  entityName: 'Jean Mukamba',   // Nom de l'entité
  description: 'Nouveau patient créé: Jean Mukamba',
  metadata: {                   // Données supplémentaires
    patientId: 123,
    age: 25,
    // ...
  }
}
```

## Types d'actions disponibles

- **CREATE** : Création d'une nouvelle entité
- **UPDATE** : Mise à jour d'une entité
- **DELETE** : Suppression d'une entité
- **VIEW** : Consultation/Affichage
- **LOGIN** : Connexion utilisateur
- **LOGOUT** : Déconnexion utilisateur
- **DOWNLOAD** : Téléchargement de document

## Entités supportées

- Patient
- Doctor
- Consultation
- Hospital
- Medicament
- Prescription
- Disease
- Study
- HealthZone
- Activity (logging lui-même)

## Page de visualisation

Toutes les activités sont visibles dans : `/activities`

## Notes importantes

1. Les activités sont enregistrées de manière **asynchrone** pour ne pas bloquer les opérations
2. Le logging ne bloque jamais l'exécution normale même en cas d'erreur
3. Les mots de passe sont automatiquement filtrés des métadonnées
4. Chaque activité est timestampée automatiquement

