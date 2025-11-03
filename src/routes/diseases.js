const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  getAllDiseases,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease
} = require('../controllers/diseasesController');

// Validation rules (simplifié pour éviter les erreurs)
const diseaseValidation = [
  body('name').notEmpty().withMessage('Nom de la maladie requis'),
  body('description').optional(),
  body('symptoms').optional(),
  body('treatment').optional(),
  body('prevalence').optional(),
  body('zone').optional(),
  body('severity').optional()
];

// Routes
router.get('/', authenticateToken, getAllDiseases);
router.get('/:id', authenticateToken, getDiseaseById);
router.post('/', authenticateToken, diseaseValidation, handleValidationErrors, createDisease);
router.put('/:id', authenticateToken, diseaseValidation, handleValidationErrors, updateDisease);
router.delete('/:id', authenticateToken, deleteDisease);

module.exports = router;
