const express = require('express');
const router = express.Router();
const {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation
} = require('../controllers/consultationsController');

// Obtenir toutes les consultations
router.get('/', getAllConsultations);

// Obtenir une consultation par ID
router.get('/:id', getConsultationById);

// Créer une nouvelle consultation
router.post('/', createConsultation);

// Mettre à jour une consultation
router.put('/:id', updateConsultation);

// Supprimer une consultation
router.delete('/:id', deleteConsultation);

module.exports = router;
