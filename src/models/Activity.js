const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Type d\'action (CREATE, UPDATE, DELETE, VIEW, etc.)'
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Type d\'entité (Patient, Doctor, Consultation, etc.)'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de l\'entité concernée'
  },
  entityName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nom de l\'entité (ex: nom du patient)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description détaillée de l\'action'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Adresse IP de l\'utilisateur'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'User agent du navigateur'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Informations supplémentaires (anciennes valeurs, nouvelles valeurs, etc.)'
  }
}, {
  tableName: 'tbl_activites',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = Activity;
