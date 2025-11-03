const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  archiveOldMessages
} = require('../controllers/messagesController');

// Obtenir toutes les conversations de l'utilisateur
router.get('/conversations', authenticateToken, getConversations);

// Obtenir les messages avec un utilisateur spécifique
router.get('/:userId', authenticateToken, getMessages);

// Envoyer un message
router.post('/send', authenticateToken, sendMessage);

// Archiver les messages anciens (endpoint manuel pour test)
router.post('/archive', authenticateToken, async (req, res) => {
  try {
    const count = await archiveOldMessages(30);
    res.json({
      success: true,
      message: `${count} messages archivés`,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'archivage',
      error: error.message
    });
  }
});

module.exports = router;

