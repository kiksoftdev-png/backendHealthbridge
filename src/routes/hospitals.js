const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalsStats
} = require('../controllers/hospitalsController');

// Obtenir toutes les hôpitaux
router.get('/', getAllHospitals);

// Obtenir les statistiques des hôpitaux
router.get('/stats', getHospitalsStats);

// Obtenir un hôpital par ID
router.get('/:id', getHospitalById);

// Créer un nouvel hôpital
router.post('/', createHospital);

// Mettre à jour un hôpital
router.put('/:id', updateHospital);

// Supprimer un hôpital
router.delete('/:id', deleteHospital);

module.exports = router;
