const { Medicament, sequelize } = require('../models');
const { Op } = require('sequelize');
const ActivityLogger = require('../services/activityLogger');

// Récupérer tous les médicaments
const getAllMedicaments = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, dosageForm, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { genericName: { [Op.like]: `%${search}%` } },
        { manufacturer: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (category) where.category = category;
    if (dosageForm) where.dosageForm = dosageForm;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows: medicaments } = await Medicament.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: medicaments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des médicaments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des médicaments',
      error: error.message
    });
  }
};

// Récupérer un médicament par ID
const getMedicamentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medicament = await Medicament.findByPk(id);

    if (!medicament) {
      return res.status(404).json({
        success: false,
        message: 'Médicament non trouvé'
      });
    }

    res.json({
      success: true,
      data: medicament
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du médicament:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du médicament',
      error: error.message
    });
  }
};

// Créer un nouveau médicament
const createMedicament = async (req, res) => {
  try {
    const {
      name, genericName, category, dosageForm, strength, unit,
      manufacturer, description, indications, contraindications,
      sideEffects, storageConditions, expirationDate,
      stockQuantity, minStockLevel, maxStockLevel, price,
      requiresPrescription, barcode
    } = req.body;

    // Validation basique
    if (!name || !dosageForm || !strength) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides: name, dosageForm et strength sont requis'
      });
    }

    // Vérifier si le médicament existe déjà
    const existingMedicament = await Medicament.findOne({
      where: { name }
    });

    if (existingMedicament) {
      return res.status(409).json({
        success: false,
        message: 'Un médicament avec ce nom existe déjà'
      });
    }

    const medicament = await Medicament.create({
      name,
      genericName: genericName || null,
      category: category || 'Autre',
      dosageForm,
      strength,
      unit: unit || null,
      manufacturer: manufacturer || null,
      description: description || null,
      indications: indications || null,
      contraindications: contraindications || null,
      sideEffects: sideEffects || null,
      storageConditions: storageConditions || null,
      expirationDate: expirationDate || null,
      stockQuantity: stockQuantity || 0,
      minStockLevel: minStockLevel || 10,
      maxStockLevel: maxStockLevel || 100,
      price: price || null,
      requiresPrescription: requiresPrescription !== false,
      barcode: barcode || null,
      isActive: true
    });

    // Enregistrer l'activité
    await ActivityLogger.logCreate(
      'Medicament',
      medicament,
      req.user?.id,
      {
        category: medicament.category,
        dosageForm: medicament.dosageForm,
        manufacturer: medicament.manufacturer
      }
    );

    res.status(201).json({
      success: true,
      message: 'Médicament créé avec succès',
      data: medicament
    });
  } catch (error) {
    console.error('Erreur lors de la création du médicament:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du médicament',
      error: error.message
    });
  }
};

// Mettre à jour un médicament
const updateMedicament = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const medicament = await Medicament.findByPk(id);
    if (!medicament) {
      return res.status(404).json({
        success: false,
        message: 'Médicament non trouvé'
      });
    }

    // Vérifier si le nouveau nom est déjà utilisé
    if (updates.name && updates.name !== medicament.name) {
      const existingMedicament = await Medicament.findOne({
        where: { name: updates.name }
      });

      if (existingMedicament) {
        return res.status(409).json({
          success: false,
          message: 'Un médicament avec ce nom existe déjà'
        });
      }
    }

    // Sauvegarder l'ancien état
    const oldData = { ...medicament.toJSON() };

    await medicament.update(updates);

    // Enregistrer l'activité
    await ActivityLogger.logUpdate(
      'Medicament',
      id,
      oldData,
      { ...oldData, ...updates },
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Médicament mis à jour avec succès',
      data: medicament
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du médicament:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du médicament',
      error: error.message
    });
  }
};

// Supprimer un médicament
const deleteMedicament = async (req, res) => {
  try {
    const { id } = req.params;

    const medicament = await Medicament.findByPk(id);
    if (!medicament) {
      return res.status(404).json({
        success: false,
        message: 'Médicament non trouvé'
      });
    }

    // Enregistrer l'activité
    await ActivityLogger.logDelete(
      'Medicament',
      id,
      medicament.name || 'Médicament sans nom',
      req.user?.id
    );

    await medicament.destroy();

    res.json({
      success: true,
      message: 'Médicament supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du médicament:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du médicament',
      error: error.message
    });
  }
};

// Statistiques des médicaments
const getMedicamentsStats = async (req, res) => {
  try {
    const totalMedicaments = await Medicament.count();
    const activeMedicaments = await Medicament.count({ where: { isActive: true } });
    const lowStock = await Medicament.count({
      where: sequelize.literal('stockQuantity <= minStockLevel')
    });

    res.json({
      success: true,
      data: {
        totalMedicaments,
        activeMedicaments,
        lowStock
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

module.exports = {
  getAllMedicaments,
  getMedicamentById,
  createMedicament,
  updateMedicament,
  deleteMedicament,
  getMedicamentsStats
};

