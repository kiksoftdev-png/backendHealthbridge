const express = require('express');
const router = express.Router();
const {
  getPrescriptionsByConsultation,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionsController');

// Récupérer toutes les prescriptions d'une consultation
router.get('/consultation/:consultationId', getPrescriptionsByConsultation);

// Récupérer une prescription par ID
router.get('/:id', getPrescriptionById);

// Créer une nouvelle prescription
router.post('/', createPrescription);

// Mettre à jour une prescription
router.put('/:id', updatePrescription);

// Supprimer une prescription
router.delete('/:id', deletePrescription);

module.exports = router;

