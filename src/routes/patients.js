const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientsByDoctor
} = require('../controllers/patientsController');

// Validation rules
const patientValidation = [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').notEmpty().withMessage('Le téléphone est requis'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Âge doit être entre 0 et 150'),
  body('gender').isIn(['M', 'F', 'Other']).withMessage('Genre doit être M, F ou Other'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Type sanguin invalide'),
  body('emergencyContact').optional().isLength({ min: 2, max: 100 }).withMessage('Contact d\'urgence invalide'),
  body('emergencyPhone').optional().isLength({ min: 10, max: 20 }).withMessage('Téléphone d\'urgence invalide')
];

// Routes
router.get('/', getAllPatients);
router.get('/doctor/:doctorId', getPatientsByDoctor);
router.get('/:id', getPatientById);
router.post('/', protect, patientValidation, handleValidationErrors, createPatient);
router.put('/:id', protect, patientValidation, handleValidationErrors, updatePatient);
router.delete('/:id', protect, deletePatient);

module.exports = router;
