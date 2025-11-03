const { Prescription, Consultation } = require('../models');
const ActivityLogger = require('../services/activityLogger');

// Récupérer toutes les prescriptions d'une consultation
const getPrescriptionsByConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    
    const prescriptions = await Prescription.findAll({
      where: { consultationId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: prescriptions,
      count: prescriptions.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des prescriptions',
      error: error.message
    });
  }
};

// Récupérer une prescription par ID
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findByPk(id, {
      include: [{
        model: Consultation,
        as: 'consultation'
      }]
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription non trouvée'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la prescription',
      error: error.message
    });
  }
};

// Créer une nouvelle prescription
const createPrescription = async (req, res) => {
  try {
    const { consultationId, medication, dosage, frequency, duration, instructions, status, notes } = req.body;

    // Validation basique
    if (!consultationId || !medication || !dosage || !frequency || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides: consultationId, medication, dosage, frequency et duration sont requis'
      });
    }

    // Vérifier que la consultation existe
    const consultation = await Consultation.findByPk(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation introuvable'
      });
    }

    const prescription = await Prescription.create({
      consultationId,
      medication,
      dosage,
      frequency,
      duration,
      instructions: instructions || null,
      status: status || 'En cours',
      notes: notes || null
    });

    // Enregistrer l'activité de création
    await ActivityLogger.logCreate(
      'Prescription',
      prescription,
      req.user?.id,
      { 
        consultationId,
        medication,
        dosage
      }
    );

    res.status(201).json({
      success: true,
      message: 'Prescription créée avec succès',
      data: prescription
    });
  } catch (error) {
    console.error('Erreur lors de la création de la prescription:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la prescription',
      error: error.message
    });
  }
};

// Mettre à jour une prescription
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription non trouvée'
      });
    }

    await prescription.update(updates);

    res.json({
      success: true,
      message: 'Prescription mise à jour avec succès',
      data: prescription
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la prescription',
      error: error.message
    });
  }
};

// Supprimer une prescription
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription non trouvée'
      });
    }

    // Enregistrer l'activité de suppression
    await ActivityLogger.logDelete(
      'Prescription',
      id,
      prescription.medication,
      req.user?.id
    );

    await prescription.destroy();

    res.json({
      success: true,
      message: 'Prescription supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la prescription',
      error: error.message
    });
  }
};

module.exports = {
  getPrescriptionsByConsultation,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription
};

