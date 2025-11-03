const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  specialty: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  hospital: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  experience: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  licenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  qualifications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'doctors'
});

module.exports = Doctor;
