const express = require('express');
const router = express.Router();
const {
  getAllActivities,
  createActivity,
  logDownload
} = require('../controllers/activitiesController');

// Obtenir toutes les activités
router.get('/', getAllActivities);

// Créer une activité (pour des cas spécifiques)
router.post('/', createActivity);

// Enregistrer un téléchargement
router.post('/download', logDownload);

module.exports = router;
