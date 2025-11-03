const { Disease } = require('../models');
const { validationResult } = require('express-validator');

// Récupérer toutes les maladies
const getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: diseases,
      count: diseases.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des maladies:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des maladies',
      error: error.message
    });
  }
};

// Récupérer une maladie par ID
const getDiseaseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const disease = await Disease.findByPk(id);

    if (!disease) {
      return res.status(404).json({
        success: false,
        message: 'Maladie non trouvée'
      });
    }

    res.json({
      success: true,
      data: disease
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la maladie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la maladie',
      error: error.message
    });
  }
};

// Créer une nouvelle maladie
const createDisease = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const disease = await Disease.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Maladie créée avec succès',
      data: disease
    });
  } catch (error) {
    console.error('Erreur lors de la création de la maladie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la maladie',
      error: error.message
    });
  }
};

// Mettre à jour une maladie
const updateDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const disease = await Disease.findByPk(id);
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: 'Maladie non trouvée'
      });
    }

    await disease.update(updates);

    res.json({
      success: true,
      message: 'Maladie mise à jour avec succès',
      data: disease
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la maladie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la maladie',
      error: error.message
    });
  }
};

// Supprimer une maladie
const deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;

    const disease = await Disease.findByPk(id);
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: 'Maladie non trouvée'
      });
    }

    await disease.destroy();

    res.json({
      success: true,
      message: 'Maladie supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la maladie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la maladie',
      error: error.message
    });
  }
};

module.exports = {
  getAllDiseases,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease
};
