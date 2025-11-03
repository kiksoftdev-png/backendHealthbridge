const { sequelize } = require('../config/database');

// Import des modèles
const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Disease = require('./Disease');
const Study = require('./Study');
const HealthZone = require('./HealthZone');
const Hospital = require('./Hospital');
const Consultation = require('./Consultation');
const Prescription = require('./Prescription');
const Medicament = require('./Medicament');
const Activity = require('./Activity');
const Message = require('./Message');

// Définition des associations
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Study, { foreignKey: 'researcherId', as: 'studies' });
Study.belongsTo(User, { foreignKey: 'researcherId', as: 'researcher' });

// Associations pour Hospital - Note: on utilise un alias différent pour éviter le conflit avec l'attribut 'hospitals' dans HealthZone
HealthZone.hasMany(Hospital, { foreignKey: 'healthZoneId', as: 'hospitalList' });
Hospital.belongsTo(HealthZone, { foreignKey: 'healthZoneId', as: 'healthZone' });

Doctor.hasMany(Hospital, { foreignKey: 'directorId', as: 'directedHospitals' });
Hospital.belongsTo(Doctor, { foreignKey: 'directorId', as: 'director' });

// Associations pour Consultation
Patient.hasMany(Consultation, { foreignKey: 'patientId', as: 'consultations' });
Consultation.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Consultation, { foreignKey: 'doctorId', as: 'doctorConsultations' });
Consultation.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Hospital.hasMany(Consultation, { foreignKey: 'hospitalId', as: 'hospitalConsultations' });
Consultation.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

// Associations pour Prescription
Consultation.hasMany(Prescription, { foreignKey: 'consultationId', as: 'prescriptions' });
Prescription.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });

// Associations pour Activity
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Associations pour Message
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Test de connexion à la base de données
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    throw error;
  }
};

// Synchronisation de la base de données
const syncDatabase = async () => {
  try {
    // Utiliser alter: false pour éviter les erreurs de synchronisation
    await sequelize.sync({ alter: false });
    console.log('✅ Modèles de base de données synchronisés avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Doctor,
  Patient,
  Disease,
  Study,
  HealthZone,
  Hospital,
  Consultation,
  Prescription,
  Medicament,
  Activity,
  Message,
  testConnection,
  syncDatabase
};
