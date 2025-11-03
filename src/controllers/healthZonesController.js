const { HealthZone, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const pdfService = require('../services/pdfService');

// Récupérer toutes les zones de santé
const getAllHealthZones = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, province, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Filtre par recherche
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { province: { [Op.like]: `%${search}%` } },
          { territory: { [Op.like]: `%${search}%` } },
          { chiefTown: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    // Filtre par province
    if (province) {
      whereClause.province = province;
    }

    // Filtre par statut
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: healthZones } = await HealthZone.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: healthZones,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des zones de santé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des zones de santé',
      error: error.message
    });
  }
};

// Récupérer une zone de santé par ID
const getHealthZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const healthZone = await HealthZone.findByPk(id);

    if (!healthZone) {
      return res.status(404).json({
        success: false,
        message: 'Zone de santé non trouvée'
      });
    }

    res.json({
      success: true,
      data: healthZone
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la zone de santé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la zone de santé',
      error: error.message
    });
  }
};

// Créer une nouvelle zone de santé
const createHealthZone = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const healthZoneData = req.body;

    // Vérifier si le code existe déjà
    const existingCode = await HealthZone.findOne({
      where: { code: healthZoneData.code }
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Une zone de santé avec ce code existe déjà'
      });
    }

    // Vérifier si le nom existe déjà
    const existingName = await HealthZone.findOne({
      where: { name: healthZoneData.name }
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Une zone de santé avec ce nom existe déjà'
      });
    }

    const healthZone = await HealthZone.create(healthZoneData);

    res.status(201).json({
      success: true,
      message: 'Zone de santé créée avec succès',
      data: healthZone
    });
  } catch (error) {
    console.error('Erreur lors de la création de la zone de santé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la zone de santé',
      error: error.message
    });
  }
};

// Mettre à jour une zone de santé
const updateHealthZone = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const healthZone = await HealthZone.findByPk(id);
    if (!healthZone) {
      return res.status(404).json({
        success: false,
        message: 'Zone de santé non trouvée'
      });
    }

    // Vérifier si le nouveau code existe déjà (si modifié)
    if (updates.code && updates.code !== healthZone.code) {
      const existingCode = await HealthZone.findOne({
        where: { code: updates.code }
      });

      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Une zone de santé avec ce code existe déjà'
        });
      }
    }

    // Vérifier si le nouveau nom existe déjà (si modifié)
    if (updates.name && updates.name !== healthZone.name) {
      const existingName = await HealthZone.findOne({
        where: { name: updates.name }
      });

      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Une zone de santé avec ce nom existe déjà'
        });
      }
    }

    await healthZone.update(updates);

    res.json({
      success: true,
      message: 'Zone de santé mise à jour avec succès',
      data: healthZone
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la zone de santé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la zone de santé',
      error: error.message
    });
  }
};

// Supprimer une zone de santé
const deleteHealthZone = async (req, res) => {
  try {
    const { id } = req.params;

    const healthZone = await HealthZone.findByPk(id);
    if (!healthZone) {
      return res.status(404).json({
        success: false,
        message: 'Zone de santé non trouvée'
      });
    }

    await healthZone.destroy();

    res.json({
      success: true,
      message: 'Zone de santé supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la zone de santé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la zone de santé',
      error: error.message
    });
  }
};

// Obtenir les statistiques des zones de santé
const getHealthZonesStats = async (req, res) => {
  try {
    const totalZones = await HealthZone.count();
    const activeZones = await HealthZone.count({ where: { isActive: true } });
    const functionalZones = await HealthZone.count({ where: { status: 'Fonctionnelle' } });
    
    // Statistiques par province
    const zonesByProvince = await HealthZone.findAll({
      attributes: [
        'province',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['province'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    // Statistiques par statut
    const zonesByStatus = await HealthZone.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        total: totalZones,
        active: activeZones,
        functional: functionalZones,
        byProvince: zonesByProvince,
        byStatus: zonesByStatus
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Générer un PDF détaillé pour une zone de santé
const generateHealthZonePDF = async (req, res) => {
  try {
    const { healthZoneId, healthZoneData } = req.body;

    let healthZone;
    if (healthZoneData) {
      // Utiliser les données fournies directement
      healthZone = healthZoneData;
    } else if (healthZoneId) {
      // Récupérer la zone de santé depuis la base de données
      healthZone = await HealthZone.findByPk(healthZoneId);
      if (!healthZone) {
        return res.status(404).json({
          success: false,
          message: 'Zone de santé non trouvée'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'ID de zone de santé ou données requises'
      });
    }

    // Générer le PDF
    const pdfBuffer = await pdfService.generateHealthZonePDF(healthZone);

    // Configurer les en-têtes de réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport-zone-sante-${healthZone.code}-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Envoyer le PDF
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la génération du PDF',
      error: error.message
    });
  }
};

module.exports = {
  getAllHealthZones,
  getHealthZoneById,
  createHealthZone,
  updateHealthZone,
  deleteHealthZone,
  getHealthZonesStats,
  generateHealthZonePDF
};
