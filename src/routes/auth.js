const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  logout, 
  setOnline, 
  setOffline, 
  getOnlineUsers,
  getAllUsers 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Routes d'authentification
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

// Routes pour le statut en ligne
router.post('/online', authenticateToken, setOnline);
router.post('/offline', authenticateToken, setOffline);
router.get('/online-users', authenticateToken, getOnlineUsers);
router.get('/all-users', authenticateToken, getAllUsers);

module.exports = router;
