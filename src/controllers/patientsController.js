const { Patient, User, Doctor } = require('../models');
const { validationResult } = require('express-validator');
const ActivityLogger = require('../services/activityLogger');

// Récupérer tous les patients avec leurs informations utilisateur
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Formater les données pour correspondre au format attendu par le frontend
    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      user: {
        id: patient.user.id,
        name: patient.user.name,
        email: patient.user.email,
        phone: patient.user.phone,
        avatar: patient.user.avatar || null,
        isActive: patient.user.isActive
      },
      age: patient.age,
      gender: patient.gender,
      bloodType: patient.bloodType,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      currentMedications: patient.currentMedications,
      insuranceNumber: patient.insuranceNumber,
      // Ajouter des champs calculés pour le frontend
      status: 'Stable', // Par défaut
      diagnosis: 'En cours d\'évaluation',
      doctor: 'Dr. Non assigné',
      lastVisit: new Date().toLocaleDateString('fr-FR')
    }));

    res.json({
      success: true,
      data: formattedPatients,
      count: formattedPatients.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des patients',
      error: error.message
    });
  }
};

// Récupérer un patient par ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    const formattedPatient = {
      id: patient.id,
      user: {
        id: patient.user.id,
        name: patient.user.name,
        email: patient.user.email,
        phone: patient.user.phone,
        avatar: patient.user.avatar || null,
        isActive: patient.user.isActive
      },
      age: patient.age,
      gender: patient.gender,
      bloodType: patient.bloodType,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      currentMedications: patient.currentMedications,
      insuranceNumber: patient.insuranceNumber
    };

    res.json({
      success: true,
      data: formattedPatient
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du patient',
      error: error.message
    });
  }
};

// Créer un nouveau patient
const createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { 
      name,
      email,
      phone,
      password,
      age,
      gender,
      bloodType,
      emergencyContact,
      emergencyPhone,
      medicalHistory,
      allergies,
      currentMedications,
      insuranceNumber
    } = req.body;

    // Créer d'abord l'utilisateur
    const user = await User.create({
      name,
      email,
      password: password || 'changeme123', // Mot de passe par défaut
      phone,
      role: 'patient',
      isActive: true
    });

    // Trouver le docteur assigné basé sur l'utilisateur connecté (si médecin)
    let assignedDoctorId = null;
    try {
      if (req.user?.id) {
        const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
        assignedDoctorId = doctor?.id || null;
      }
    } catch (e) {
      assignedDoctorId = null;
    }

    // Créer ensuite le patient
    const patient = await Patient.create({
      userId: user.id,
      age,
      gender,
      bloodType,
      emergencyContact,
      emergencyPhone,
      medicalHistory,
      allergies,
      currentMedications,
      insuranceNumber,
      assignedDoctorId
    });

    // Récupérer le patient avec les infos utilisateur
    const patientWithUser = await Patient.findByPk(patient.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });

    // Enregistrer l'activité
    await ActivityLogger.logCreate(
      'Patient',
      patientWithUser,
      req.user?.id,
      {
        age: patient.age,
        gender: patient.gender,
        bloodType: patient.bloodType
      }
    );

    res.status(201).json({
      success: true,
      message: 'Patient créé avec succès',
      data: patientWithUser
    });
  } catch (error) {
    console.error('Erreur lors de la création du patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du patient',
      error: error.message
    });
  }
};

// Mettre à jour un patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const patient = await Patient.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    // Sauvegarder l'ancien état
    const oldData = { ...patient.toJSON() };

    await patient.update(updates);

    // Enregistrer l'activité
    await ActivityLogger.logUpdate(
      'Patient',
      id,
      oldData,
      { ...oldData, ...updates },
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Patient mis à jour avec succès',
      data: patient
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du patient',
      error: error.message
    });
  }
};

// Supprimer un patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    // Enregistrer l'activité
    await ActivityLogger.logDelete(
      'Patient',
      id,
      patient.user?.name || patient.user?.email || 'Patient sans nom',
      req.user?.id
    );

    await patient.destroy();

    res.json({
      success: true,
      message: 'Patient supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du patient',
      error: error.message
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
