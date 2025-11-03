const { Activity, User, sequelize } = require('../models');
const ActivityLogger = require('../services/activityLogger');

// Récupérer toutes les activités
const getAllActivities = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entityType, userId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    const { count, rows: activities } = await Activity.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: activities,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des activités',
      error: error.message
    });
  }
};

// Créer une activité
const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create({
      ...req.body,
      userId: req.user?.id || req.body.userId
    });

    res.status(201).json({
      success: true,
      message: 'Activité enregistrée',
      data: activity
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'activité',
      error: error.message
    });
  }
};

// Enregistrer un téléchargement
const logDownload = async (req, res) => {
  try {
    const { documentType, fileName } = req.body;

    await ActivityLogger.logDownload(
      documentType,
      fileName,
      req.user?.id
    );

    res.json({
      success: true,
      message: 'Téléchargement enregistré'
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'enregistrement',
      error: error.message
    });
  }
};

// Middleware pour enregistrer automatiquement les activités
const logActivity = async (req, res, next) => {
  try {
    const originalSend = res.json;
    
    res.json = function(data) {
      if (data.success) {
        // Enregistrer l'activité en arrière-plan
        Activity.create({
          userId: req.user?.id,
          action: getActionFromMethod(req.method),
          entityType: getEntityTypeFromPath(req.path),
          entityId: req.params.id || null,
          description: `${req.method} ${req.path}`,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            body: req.body,
            query: req.query,
            params: req.params
          }
        }).catch(err => console.error('Erreur lors de l\'enregistrement de l\'activité:', err));
      }
      return originalSend.call(this, data);
    };
    
    next();
  } catch (error) {
    next();
  }
};

const getActionFromMethod = (method) => {
  const methods = {
    'GET': 'VIEW',
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };
  return methods[method] || 'UNKNOWN';
};

const getEntityTypeFromPath = (path) => {
  if (path.includes('patients')) return 'Patient';
  if (path.includes('doctors')) return 'Doctor';
  if (path.includes('consultations')) return 'Consultation';
  if (path.includes('hospitals')) return 'Hospital';
  if (path.includes('health-zones')) return 'HealthZone';
  if (path.includes('diseases')) return 'Disease';
  if (path.includes('studies')) return 'Study';
  return 'Unknown';
};

module.exports = {
  getAllActivities,
  createActivity,
  logActivity,
  logDownload
};
