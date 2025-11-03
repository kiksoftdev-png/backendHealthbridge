const { Hospital, HealthZone, Doctor, User, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const ActivityLogger = require('../services/activityLogger');

// Récupérer tous les hôpitaux
const getAllHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, province, category, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
      ];
    }
    if (province) {
      where.province = province;
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows: hospitals } = await Hospital.findAndCountAll({
      where,
      include: [
        {
          model: HealthZone,
          as: 'healthZone',
          attributes: ['id', 'name', 'code', 'province']
        },
        {
          model: Doctor,
          as: 'director',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: hospitals,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des hôpitaux',
      error: error.message
    });
  }
};

// Récupérer un hôpital par ID
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByPk(id, {
      include: [
        {
          model: HealthZone,
          as: 'healthZone',
          attributes: ['id', 'name', 'code', 'province', 'chiefTown']
        },
        {
          model: Doctor,
          as: 'director',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }]
        }
      ]
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hôpital non trouvé'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'hôpital:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'hôpital',
      error: error.message
    });
  }
};

// Créer un nouvel hôpital
const createHospital = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const hospital = await Hospital.create(req.body);
    
    // Récupérer l'hôpital avec les relations
    const hospitalWithRelations = await Hospital.findByPk(hospital.id, {
      include: [
        {
          model: HealthZone,
          as: 'healthZone',
          attributes: ['id', 'name', 'code', 'province']
        },
        {
          model: Doctor,
          as: 'director',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }]
        }
      ]
    });

    // Enregistrer l'activité
    await ActivityLogger.logCreate(
      'Hospital',
      hospitalWithRelations,
      req.user?.id,
      {
        code: hospital.code,
        city: hospital.city,
        province: hospital.province,
        category: hospital.category
      }
    );

    res.status(201).json({
      success: true,
      message: 'Hôpital créé avec succès',
      data: hospitalWithRelations
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'hôpital:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'hôpital',
      error: error.message
    });
  }
};

// Mettre à jour un hôpital
const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hôpital non trouvé'
      });
    }

    // Sauvegarder l'ancien état
    const oldData = { ...hospital.toJSON() };

    await hospital.update(updates);
    
    // Récupérer l'hôpital mis à jour avec les relations
    const updatedHospital = await Hospital.findByPk(id, {
      include: [
        {
          model: HealthZone,
          as: 'healthZone',
          attributes: ['id', 'name', 'code', 'province']
        },
        {
          model: Doctor,
          as: 'director',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }]
        }
      ]
    });

    // Enregistrer l'activité
    await ActivityLogger.logUpdate(
      'Hospital',
      id,
      oldData,
      { ...oldData, ...updates },
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Hôpital mis à jour avec succès',
      data: updatedHospital
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'hôpital:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'hôpital',
      error: error.message
    });
  }
};

// Supprimer un hôpital
const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByPk(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hôpital non trouvé'
      });
    }

    // Enregistrer l'activité
    await ActivityLogger.logDelete(
      'Hospital',
      id,
      hospital.name || hospital.code || 'Hôpital sans nom',
      req.user?.id
    );

    await hospital.destroy();
    res.json({
      success: true,
      message: 'Hôpital supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'hôpital:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'hôpital',
      error: error.message
    });
  }
};

// Obtenir les statistiques des hôpitaux
const getHospitalsStats = async (req, res) => {
  try {
    const totalHospitals = await Hospital.count();
    const operationalHospitals = await Hospital.count({ where: { status: 'Opérationnel' } });
    const totalBeds = await Hospital.sum('beds');

    res.json({
      success: true,
      data: {
        totalHospitals,
        operationalHospitals,
        totalBeds
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des hôpitaux:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques des hôpitaux',
      error: error.message
    });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalsStats
};
