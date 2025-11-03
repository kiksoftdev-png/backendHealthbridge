const express = require('express');
const router = express.Router();
const { Doctor, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDoctor } = require('../middleware/validation');
const { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorsController');

// Obtenir tous les médecins
router.get('/', getAllDoctors);

// Obtenir un médecin par ID
router.get('/:id', getDoctorById);

// Créer un nouveau médecin
router.post('/', createDoctor);

// Mettre à jour un médecin
router.put('/:id', updateDoctor);

// Supprimer un médecin
router.delete('/:id', deleteDoctor);

module.exports = router;
