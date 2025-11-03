const express = require('express');
const router = express.Router();
const {
  getAllMedicaments,
  getMedicamentById,
  createMedicament,
  updateMedicament,
  deleteMedicament,
  getMedicamentsStats
} = require('../controllers/medicamentsController');

// Obtenir tous les médicaments
router.get('/', getAllMedicaments);

// Obtenir les statistiques des médicaments
router.get('/stats', getMedicamentsStats);

// Obtenir un médicament par ID
router.get('/:id', getMedicamentById);

// Créer un nouveau médicament
router.post('/', createMedicament);

// Mettre à jour un médicament
router.put('/:id', updateMedicament);

// Supprimer un médicament
router.delete('/:id', deleteMedicament);

module.exports = router;

