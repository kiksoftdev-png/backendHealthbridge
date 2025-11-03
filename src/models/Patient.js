const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
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
  assignedDoctorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'docteur_assigne_id',
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 150
    }
  },
  gender: {
    type: DataTypes.ENUM('M', 'F', 'Other'),
    allowNull: false
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  emergencyPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentMedications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  insuranceNumber: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'patients'
});

module.exports = Patient;
