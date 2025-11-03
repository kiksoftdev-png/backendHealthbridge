const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consultation = sequelize.define('Consultation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  hospitalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  consultationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  chiefComplaint: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motif de consultation'
  },
  symptoms: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Symptômes'
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Diagnostic'
  },
  bloodPressure: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Ex: 120/80'
  },
  heartRate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Battements par minute'
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Température en Celsius'
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Poids en kg'
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Taille en cm'
  },
  physicalExamination: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Examen physique'
  },
  labResults: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Résultats de laboratoire'
  },
  prescribedMedications: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Médicaments prescrits'
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('En attente', 'En cours', 'Terminée', 'Annulée', 'Reportée'),
    defaultValue: 'En attente'
  },
  priority: {
    type: DataTypes.ENUM('Faible', 'Normale', 'Élevée', 'Urgente'),
    defaultValue: 'Normale'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Coût total de la consultation en USD'
  },
  paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'consultations',
  timestamps: true
});

module.exports = Consultation;
