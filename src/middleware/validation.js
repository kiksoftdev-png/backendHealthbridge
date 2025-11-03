const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données de validation invalides',
      errors: errors.array()
    });
  }
  next();
};

// Validation pour l'inscription
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'nurse', 'patient'])
    .withMessage('Rôle invalide'),
  handleValidationErrors
];

// Validation pour la connexion
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  handleValidationErrors
];

// Validation pour les médecins
const validateDoctor = [
  body('specialty')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La spécialité doit contenir entre 2 et 100 caractères'),
  body('hospital')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('L\'hôpital doit contenir entre 2 et 200 caractères'),
  body('zone')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La zone doit contenir entre 2 et 100 caractères'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La note doit être entre 0 et 5'),
  handleValidationErrors
];

// Validation pour les patients
const validatePatient = [
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('L\'âge doit être entre 0 et 150'),
  body('gender')
    .isIn(['M', 'F', 'Other'])
    .withMessage('Le genre doit être M, F ou Other'),
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Type de sang invalide'),
  handleValidationErrors
];

// Validation pour les maladies
const validateDisease = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Le nom de la maladie doit contenir entre 2 et 200 caractères'),
  body('prevalence')
    .isIn(['Faible', 'Modérée', 'Élevée', 'Très élevée'])
    .withMessage('Prévalence invalide'),
  body('severity')
    .isIn(['Faible', 'Modérée', 'Élevée', 'Critique'])
    .withMessage('Sévérité invalide'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateDoctor,
  validatePatient,
  validateDisease
};
