const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  consultationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'consultations',
      key: 'id'
    }
  },
  medication: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nom du médicament'
  },
  dosage: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Posologie (ex: 500mg)'
  },
  frequency: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Fréquence (ex: 3 fois par jour)'
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Durée du traitement (ex: 5 jours)'
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Instructions spéciales (ex: Prendre après les repas)'
  },
  status: {
    type: DataTypes.ENUM('En cours', 'Terminée', 'Interrompue'),
    defaultValue: 'En cours'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes additionnelles'
  }
}, {
  tableName: 'prescriptions',
  timestamps: true
});

module.exports = Prescription;

