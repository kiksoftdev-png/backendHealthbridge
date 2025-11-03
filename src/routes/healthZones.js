const express = require('express');
const router = express.Router();
const {
  getAllHealthZones,
  getHealthZoneById,
  createHealthZone,
  updateHealthZone,
  deleteHealthZone,
  getHealthZonesStats,
  generateHealthZonePDF
} = require('../controllers/healthZonesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateHealthZone } = require('../middleware/validation');

// Obtenir toutes les zones de santé
router.get('/', getAllHealthZones);

// Obtenir les statistiques des zones de santé
router.get('/stats', getHealthZonesStats);

// Obtenir une zone de santé par ID
router.get('/:id', getHealthZoneById);

// Générer un PDF détaillé pour une zone de santé
router.post('/generate-pdf', generateHealthZonePDF);

// Créer une nouvelle zone de santé
router.post('/', createHealthZone);

// Mettre à jour une zone de santé
router.put('/:id', updateHealthZone);

// Supprimer une zone de santé
router.delete('/:id', deleteHealthZone);

module.exports = router;
