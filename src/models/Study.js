const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Study = sequelize.define('Study', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  researcherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  zone: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Planifiée', 'En cours', 'Terminée', 'Annulée'),
    allowNull: false,
    defaultValue: 'Planifiée'
  },
  participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  studyType: {
    type: DataTypes.ENUM('Observationnelle', 'Expérimentale', 'Épidémiologique', 'Clinique'),
    allowNull: false,
    defaultValue: 'Observationnelle'
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  methodology: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  results: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  conclusions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  funding: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  ethicsApproval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'studies'
});

module.exports = Study;
