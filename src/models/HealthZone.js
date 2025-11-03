const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HealthZone = sequelize.define('HealthZone', {
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
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  territory: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  chiefTown: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  population: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Superficie en km²'
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Coordonnées GPS {latitude, longitude}'
  },
  healthCenters: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Nombre de centres de santé'
  },
  hospitals: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Nombre d\'hôpitaux'
  },
  healthPosts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Nombre de postes de santé'
  },
  doctors: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Nombre de médecins'
  },
  nurses: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Nombre d\'infirmiers'
  },
  midwives: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Nombre de sages-femmes'
  },
  healthWorkers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Nombre total d\'agents de santé'
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Budget annuel en USD'
  },
  infrastructure: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Infrastructures disponibles'
  },
  services: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Services de santé offerts'
  },
  challenges: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Défis et problèmes identifiés'
  },
  priorities: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Priorités et objectifs'
  },
  contactPerson: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Personne de contact'
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Téléphone de contact'
  },
  contactEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Email de contact'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Zone de santé active'
  },
  status: {
    type: DataTypes.ENUM('Fonctionnelle', 'Partiellement fonctionnelle', 'Non fonctionnelle', 'En construction'),
    defaultValue: 'Fonctionnelle'
  },
  lastEvaluation: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de dernière évaluation'
  },
  nextEvaluation: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de prochaine évaluation'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes et observations'
  }
}, {
  tableName: 'health_zones',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = HealthZone;
