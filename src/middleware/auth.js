const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide ou utilisateur inactif' 
      });
    }

    // Mettre à jour le statut en ligne et la dernière activité
    // On ne met pas à jour la base de données à chaque requête pour éviter la surcharge
    // On le fait en tâche de fond seulement
    if (!user.isOnline) {
      user.update({ 
        isOnline: true, 
        lastActiveAt: new Date() 
      }).catch(err => console.error('Erreur mise à jour statut:', err));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expiré' 
      });
    }
    
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès refusé. Rôle insuffisant.' 
      });
    }

    next();
  };
};

module.exports = {
  protect: authenticateToken,
  authenticateToken,
  authorizeRoles
};
