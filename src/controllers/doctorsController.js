const { Doctor, User } = require('../models');
const { validationResult } = require('express-validator');
const ActivityLogger = require('../services/activityLogger');

// Récupérer tous les médecins avec leurs informations utilisateur
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Formater les données pour correspondre au format attendu par le frontend
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      user: {
        id: doctor.user.id,
        name: doctor.user.name,
        email: doctor.user.email,
        phone: doctor.user.phone,
        avatar: doctor.user.avatar || null,
        isActive: doctor.user.isActive
      },
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      zone: doctor.zone,
      experience: doctor.experience,
      rating: doctor.rating,
      isOnline: doctor.isOnline,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      languages: doctor.languages || []
    }));

    res.json({
      success: true,
      data: formattedDoctors,
      count: formattedDoctors.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des médecins',
      error: error.message
    });
  }
};

// Récupérer un médecin par ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const formattedDoctor = {
      id: doctor.id,
      user: {
        id: doctor.user.id,
        name: doctor.user.name,
        email: doctor.user.email,
        phone: doctor.user.phone,
        avatar: doctor.user.avatar || null,
        isActive: doctor.user.isActive
      },
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      zone: doctor.zone,
      experience: doctor.experience,
      rating: doctor.rating,
      isOnline: doctor.isOnline,
      licenseNumber: doctor.licenseNumber,
      qualifications: doctor.qualifications,
      languages: doctor.languages || []
    };

    res.json({
      success: true,
      data: formattedDoctor
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du médecin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du médecin',
      error: error.message
    });
  }
};

// Créer un nouveau médecin
const createDoctor = async (req, res) => {
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
      password, 
      phone, 
      specialty, 
      hospital, 
      zone, 
      experience, 
      rating, 
      isOnline, 
      licenseNumber, 
      qualifications, 
      languages 
    } = req.body;

    // Créer d'abord l'utilisateur
    const user = await User.create({
      name,
      email,
      password, // Le mot de passe sera hashé automatiquement par le modèle
      phone,
      role: 'doctor',
      isActive: true
    });

    // Créer ensuite le médecin
    const doctor = await Doctor.create({
      userId: user.id,
      specialty,
      hospital,
      zone,
      experience,
      rating: rating || 0,
      isOnline: isOnline || false,
      licenseNumber,
      qualifications,
      languages: languages || []
    });

    // Récupérer le médecin avec les informations utilisateur
    const doctorWithUser = await Doctor.findByPk(doctor.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });

    // Enregistrer l'activité
    await ActivityLogger.logCreate(
      'Doctor',
      doctorWithUser,
      req.user?.id,
      {
        specialty: doctorWithUser.specialty,
        hospital: doctorWithUser.hospital,
        zone: doctorWithUser.zone
      }
    );

    res.status(201).json({
      success: true,
      message: 'Médecin créé avec succès',
      data: doctorWithUser
    });
  } catch (error) {
    console.error('Erreur lors de la création du médecin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du médecin',
      error: error.message
    });
  }
};

// Mettre à jour un médecin
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doctor = await Doctor.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    // Sauvegarder l'ancien état
    const oldData = { ...doctor.toJSON() };

    await doctor.update(updates);

    // Enregistrer l'activité
    await ActivityLogger.logUpdate(
      'Doctor',
      id,
      oldData,
      { ...oldData, ...updates },
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Médecin mis à jour avec succès',
      data: doctor
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du médecin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du médecin',
      error: error.message
    });
  }
};

// Supprimer un médecin
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive']
      }]
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    // Enregistrer l'activité
    await ActivityLogger.logDelete(
      'Doctor',
      id,
      doctor.user?.name || doctor.user?.email || 'Médecin sans nom',
      req.user?.id
    );

    await doctor.destroy();

    res.json({
      success: true,
      message: 'Médecin supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du médecin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du médecin',
      error: error.message
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
