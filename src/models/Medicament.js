const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Medicament = sequelize.define('Medicament', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    comment: 'Nom commercial du médicament'
  },
  genericName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nom générique (principe actif)'
  },
  category: {
    type: DataTypes.ENUM('Antibiotique', 'Antalgique', 'Anti-inflammatoire', 'Antihistaminique', 'Antiviral', 'Antifongique', 'Vitamines', 'Autre'),
    defaultValue: 'Autre'
  },
  dosageForm: {
    type: DataTypes.ENUM('Comprimé', 'Gélule', 'Sirop', 'Injection', 'Pommade', 'Crème', 'Spray', 'Gouttes', 'Suppositoire', 'Autre'),
    allowNull: false,
    comment: 'Forme galénique'
  },
  strength: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Concentration (ex: 500mg, 10ml)'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Unité (mg, ml, g, etc.)'
  },
  manufacturer: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Laboratoire pharmaceutique'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description du médicament'
  },
  indications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Indications thérapeutiques'
  },
  contraindications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Contre-indications'
  },
  sideEffects: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Effets secondaires possibles'
  },
  storageConditions: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Conditions de conservation'
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de péremption'
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Quantité en stock'
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Niveau de stock minimum'
  },
  maxStockLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Niveau de stock maximum'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Prix unitaire en USD'
  },
  requiresPrescription: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Nécessite une ordonnance'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Médicament actif ou désactivé'
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'Code-barres du médicament'
  }
}, {
  tableName: 'medicaments',
  timestamps: true
});

module.exports = Medicament;

