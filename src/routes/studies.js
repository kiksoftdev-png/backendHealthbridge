const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  getAllStudies,
  getStudyById,
  createStudy,
  updateStudy,
  deleteStudy
} = require('../controllers/studiesController');

// Validation rules
const studyValidation = [
  body('title').isLength({ min: 5, max: 300 }).withMessage('Titre requis (5-300 caractères)'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description trop longue'),
  body('researcherId').isInt().withMessage('ID chercheur requis'),
  body('zone').isLength({ min: 2, max: 100 }).withMessage('Zone requise (2-100 caractères)'),
  body('startDate').isISO8601().withMessage('Date de début invalide'),
  body('endDate').optional().isISO8601().withMessage('Date de fin invalide'),
  body('status').isIn(['Planifiée', 'En cours', 'Terminée', 'Annulée']).withMessage('Statut invalide'),
  body('participants').isInt({ min: 0 }).withMessage('Nombre de participants invalide'),
  body('studyType').isIn(['Observationnelle', 'Expérimentale', 'Épidémiologique', 'Clinique']).withMessage('Type d\'étude invalide'),
  body('objectives').optional().isLength({ max: 1000 }).withMessage('Objectifs trop longs'),
  body('methodology').optional().isLength({ max: 1000 }).withMessage('Méthodologie trop longue'),
  body('funding').optional().isLength({ max: 200 }).withMessage('Financement trop long'),
  body('ethicsApproval').optional().isBoolean().withMessage('Approbation éthique doit être un booléen')
];

// Routes
router.get('/', protect, getAllStudies);
router.get('/:id', protect, getStudyById);
router.post('/', protect, studyValidation, handleValidationErrors, createStudy);
router.put('/:id', protect, studyValidation, handleValidationErrors, updateStudy);
router.delete('/:id', protect, deleteStudy);

module.exports = router;
