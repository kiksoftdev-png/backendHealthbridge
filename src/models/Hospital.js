const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hospital = sequelize.define('Hospital', {
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
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  healthZoneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'health_zones',
      key: 'id'
    }
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  directorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.ENUM('Hôpital général', 'Hôpital universitaire', 'Hôpital psychiatrique', 'Hôpital spécialisé', 'Centre hospitalier'),
    defaultValue: 'Hôpital général'
  },
  level: {
    type: DataTypes.ENUM('Tertiaire', 'Secondaire', 'Primaire'),
    defaultValue: 'Secondaire'
  },
  beds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  departments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Liste des départements/services'
  },
  specialties: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Liste des spécialités offertes'
  },
  staff: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Composition du personnel (doctors, nurses, etc.)'
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Budget annuel en USD'
  },
  accreditation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  yearEstablished: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('Opérationnel', 'Partiellement opérationnel', 'En maintenance', 'Fermé'),
    defaultValue: 'Opérationnel'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Installations et équipements'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'hospitals',
  timestamps: true
});

module.exports = Hospital;
