const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Disease = sequelize.define('Disease', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prevention: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prevalence: {
    type: DataTypes.ENUM('Faible', 'Modérée', 'Élevée', 'Très élevée'),
    allowNull: false,
    defaultValue: 'Modérée'
  },
  zone: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isContagious: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  severity: {
    type: DataTypes.ENUM('Faible', 'Modérée', 'Élevée', 'Critique'),
    allowNull: false,
    defaultValue: 'Modérée'
  },
  icd10Code: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
}, {
  tableName: 'diseases'
});

module.exports = Disease;
