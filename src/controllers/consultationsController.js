const { Consultation, Patient, Doctor, Hospital, User, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const ActivityLogger = require('../services/activityLogger');

// Récupérer toutes les consultations
const getAllConsultations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority, doctorId, patientId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[sequelize.Op.or] = [
        { chiefComplaint: { [sequelize.Op.like]: `%${search}%` } },
        { diagnosis: { [sequelize.Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const { count, rows: consultations } = await Consultation.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'age', 'gender'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }]
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'specialty'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'name', 'code']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['consultationDate', 'DESC']]
    });

    res.json({
      success: true,
      data: consultations,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des consultations',
      error: error.message
    });
  }
};

// Récupérer une consultation par ID
const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Hospital,
          as: 'hospital'
        }
      ]
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation non trouvée'
      });
    }

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la consultation',
      error: error.message
    });
  }
};

// Créer une nouvelle consultation
const createConsultation = async (req, res) => {
  try {
    console.log('Données reçues:', JSON.stringify(req.body, null, 2));
    
    // Validation basique
    if (!req.body.patientId || !req.body.doctorId || !req.body.consultationDate) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides: patientId, doctorId et consultationDate sont requis',
        received: req.body
      });
    }

    // Vérifier que le patient existe
    const patient = await Patient.findByPk(req.body.patientId);
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Patient introuvable'
      });
    }

    // Vérifier que le médecin existe
    const doctor = await Doctor.findByPk(req.body.doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: 'Médecin introuvable'
      });
    }

    // Vérifier que l'hôpital existe si fourni
    if (req.body.hospitalId) {
      const hospital = await Hospital.findByPk(req.body.hospitalId);
      if (!hospital) {
        return res.status(400).json({
          success: false,
          message: 'Hôpital introuvable'
        });
      }
    }

    const consultation = await Consultation.create(req.body);
    
    // Enregistrer l'activité de création
    await ActivityLogger.logCreate(
      'Consultation',
      consultation,
      req.user?.id,
      { 
        patientId: consultation.patientId,
        doctorId: consultation.doctorId,
        hospitalId: consultation.hospitalId 
      }
    );
    
    const consultationWithRelations = await Consultation.findByPk(consultation.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Hospital,
          as: 'hospital'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Consultation créée avec succès',
      data: consultationWithRelations
    });
  } catch (error) {
    console.error('Erreur lors de la création de la consultation:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la consultation',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Mettre à jour une consultation
const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const consultation = await Consultation.findByPk(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation non trouvée'
      });
    }

    // Sauvegarder l'ancien état
    const oldData = { ...consultation.toJSON() };
    
    await consultation.update(updates);
    
    // Enregistrer l'activité de mise à jour
    await ActivityLogger.logUpdate(
      'Consultation',
      id,
      oldData,
      { ...oldData, ...updates },
      req.user?.id
    );
    
    const updatedConsultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Hospital,
          as: 'hospital'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Consultation mise à jour avec succès',
      data: updatedConsultation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la consultation',
      error: error.message
    });
  }
};

// Supprimer une consultation
const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }]
        }
      ]
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation non trouvée'
      });
    }

    const consultationName = consultation.patient?.user?.name || `Consultation #${id}`;

    // Enregistrer l'activité de suppression
    await ActivityLogger.logDelete(
      'Consultation',
      id,
      consultationName,
      req.user?.id
    );

    await consultation.destroy();
    res.json({
      success: true,
      message: 'Consultation supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la consultation',
      error: error.message
    });
  }
};

module.exports = {
  getAllConsultations,
  getConsultationById,
  createConsultation,
  updateConsultation,
  deleteConsultation
};
