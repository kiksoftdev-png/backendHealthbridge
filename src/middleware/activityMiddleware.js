const ActivityLogger = require('../services/activityLogger');

/**
 * Middleware pour enregistrer automatiquement les activités après une opération réussie
 * Usage: placez ce middleware APRÈS une opération CRUD réussie
 */
const logActivityAfterSuccess = (entityType) => {
  return async (req, res, next) => {
    // Sauvegarder l'ancienne fonction send
    const originalJson = res.json.bind(res);
    
    // Override res.json pour intercepter les réponses
    res.json = function(data) {
      if (data.success) {
        const activityData = {
          userId: req.user?.id,
          action: getActionFromMethod(req.method),
          entityType,
          entityId: req.params.id,
          description: `${req.method} ${req.path}`,
          metadata: {
            body: req.body,
            params: req.params
          }
        };
        
        // Enregistrer l'activité en arrière-plan (ne pas bloquer la réponse)
        ActivityLogger.logActivity(activityData).catch(err => 
          console.error('Erreur lors de l\'enregistrement de l\'activité:', err)
        );
      }
      
      return originalJson(data);
    };
    
    next();
  };
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

module.exports = {
  logActivityAfterSuccess
};

