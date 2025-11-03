const jwt = require('jsonwebtoken');
const { User, Doctor, Patient } = require('../models');
const ActivityLogger = require('../services/activityLogger');

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Inscription
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'patient', ...additionalData } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Créer le profil spécifique selon le rôle
    if (role === 'doctor' && additionalData.specialty) {
      await Doctor.create({
        userId: user.id,
        specialty: additionalData.specialty,
        hospital: additionalData.hospital || '',
        zone: additionalData.zone || ''
      });
    } else if (role === 'patient') {
      await Patient.create({
        userId: user.id,
        age: additionalData.age || 0,
        gender: additionalData.gender || 'M'
      });
    }

    // Générer le token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Mettre à jour la dernière connexion et marquer comme en ligne
    await user.update({ 
      lastLogin: new Date(), 
      isOnline: true, 
      lastActiveAt: new Date() 
    });

    // Enregistrer l'activité de connexion
    await ActivityLogger.logLogin(
      user.id,
      user.name,
      req.ip || req.connection.remoteAddress,
      req.get('user-agent')
    );

    // Générer le token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir le profil utilisateur
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { association: 'doctorProfile' },
        { association: 'patientProfile' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Déconnexion
const logout = async (req, res) => {
  try {
    // Enregistrer l'activité de déconnexion
    if (req.user?.id) {
      await ActivityLogger.logLogout(req.user.id, req.user.name);
      // Marquer l'utilisateur comme hors ligne
      await User.update(
        { isOnline: false, lastActiveAt: new Date() },
        { where: { id: req.user.id } }
      );
    }

    // Dans un système JWT, la déconnexion se fait côté client
    // Ici on peut ajouter une blacklist de tokens si nécessaire
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Marquer l'utilisateur comme en ligne
const setOnline = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await user.update({
      isOnline: true,
      lastActiveAt: new Date()
    });

    res.json({
      success: true,
      message: 'Statut en ligne mis à jour'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Marquer l'utilisateur comme hors ligne
const setOffline = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await user.update({
      isOnline: false,
      lastActiveAt: new Date()
    });

    res.json({
      success: true,
      message: 'Statut hors ligne mis à jour'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les utilisateurs en ligne
const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await User.findAll({
      where: { isOnline: true },
      attributes: ['id', 'name', 'email', 'role', 'avatar', 'lastActiveAt', 'isOnline'],
      order: [['lastActiveAt', 'DESC']]
    });

    res.json({
      success: true,
      data: onlineUsers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs en ligne:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir tous les utilisateurs (pour le chat)
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'avatar', 'lastActiveAt', 'isOnline'],
      order: [
        ['isOnline', 'DESC'], // Utilisateurs en ligne en premier
        ['lastActiveAt', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: allUsers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  setOnline,
  setOffline,
  getOnlineUsers,
  getAllUsers
};
