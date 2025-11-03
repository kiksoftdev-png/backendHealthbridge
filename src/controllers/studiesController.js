const { Study, User } = require('../models');
const { validationResult } = require('express-validator');

// Récupérer toutes les études avec les informations du chercheur
const getAllStudies = async (req, res) => {
  try {
    const studies = await Study.findAll({
      include: [{
        model: User,
        as: 'researcher',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Formater les données pour correspondre au format attendu par le frontend
    const formattedStudies = studies.map(study => ({
      id: study.id,
      title: study.title,
      description: study.description,
      researcher: study.researcher ? study.researcher.name : 'Chercheur inconnu',
      zone: study.zone,
      startDate: study.startDate,
      endDate: study.endDate,
      status: study.status,
      participants: study.participants,
      studyType: study.studyType,
      objectives: study.objectives,
      methodology: study.methodology,
      results: study.results,
      conclusions: study.conclusions,
      funding: study.funding,
      ethicsApproval: study.ethicsApproval
    }));

    res.json({
      success: true,
      data: formattedStudies,
      count: formattedStudies.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des études:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des études',
      error: error.message
    });
  }
};

// Récupérer une étude par ID
const getStudyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const study = await Study.findByPk(id, {
      include: [{
        model: User,
        as: 'Researcher',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!study) {
      return res.status(404).json({
        success: false,
        message: 'Étude non trouvée'
      });
    }

    const formattedStudy = {
      id: study.id,
      title: study.title,
      description: study.description,
      researcher: study.researcher ? study.researcher.name : 'Chercheur inconnu',
      zone: study.zone,
      startDate: study.startDate,
      endDate: study.endDate,
      status: study.status,
      participants: study.participants,
      studyType: study.studyType,
      objectives: study.objectives,
      methodology: study.methodology,
      results: study.results,
      conclusions: study.conclusions,
      funding: study.funding,
      ethicsApproval: study.ethicsApproval
    };

    res.json({
      success: true,
      data: formattedStudy
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étude:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'étude',
      error: error.message
    });
  }
};

// Créer une nouvelle étude
const createStudy = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const study = await Study.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Étude créée avec succès',
      data: study
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'étude:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'étude',
      error: error.message
    });
  }
};

// Mettre à jour une étude
const updateStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const study = await Study.findByPk(id);
    if (!study) {
      return res.status(404).json({
        success: false,
        message: 'Étude non trouvée'
      });
    }

    await study.update(updates);

    res.json({
      success: true,
      message: 'Étude mise à jour avec succès',
      data: study
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étude:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'étude',
      error: error.message
    });
  }
};

// Supprimer une étude
const deleteStudy = async (req, res) => {
  try {
    const { id } = req.params;

    const study = await Study.findByPk(id);
    if (!study) {
      return res.status(404).json({
        success: false,
        message: 'Étude non trouvée'
      });
    }

    await study.destroy();

    res.json({
      success: true,
      message: 'Étude supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étude:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'étude',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudies,
  getStudyById,
  createStudy,
  updateStudy,
  deleteStudy
};
