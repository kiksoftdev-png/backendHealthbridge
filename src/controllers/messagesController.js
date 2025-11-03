const { Message, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtenir les conversations d'un utilisateur
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer toutes les conversations où l'utilisateur est impliqué
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar', 'role']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      group: ['senderId', 'receiverId']
    });

    // Traiter les conversations pour obtenir les interlocuteurs uniques
    const uniqueConversations = {};
    conversations.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      
      if (!uniqueConversations[otherUserId] || 
          new Date(msg.createdAt) > new Date(uniqueConversations[otherUserId].lastMessage.createdAt)) {
        uniqueConversations[otherUserId] = {
          user: otherUser,
          lastMessage: msg
        };
      }
    });

    res.json({
      success: true,
      data: Object.values(uniqueConversations)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des conversations',
      error: error.message
    });
  }
};

// Obtenir les messages entre deux utilisateurs
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.id;
    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          {
            senderId: currentUserId,
            receiverId: userId
          },
          {
            senderId: userId,
            receiverId: currentUserId
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Marquer les messages comme lus
    await Message.update(
      { 
        isRead: true, 
        readAt: new Date() 
      },
      {
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      data: messages.rows.reverse(), // Inverser pour avoir les plus anciens en premier
      pagination: {
        total: messages.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(messages.count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Envoyer un message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'receiverId et content sont requis'
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    const messageWithRelations = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    // Émettre l'événement Socket.io
    req.io.emit(`message:${receiverId}`, messageWithRelations);

    res.status(201).json({
      success: true,
      message: 'Message envoyé',
      data: messageWithRelations
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi du message',
      error: error.message
    });
  }
};

// Archiver les messages anciens (appelé via cron job)
const archiveOldMessages = async (daysOld = 30) => {
  try {
    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - daysOld);

    const archivedCount = await Message.destroy({
      where: {
        [Op.and]: [
          { createdAt: { [Op.lt]: archiveDate } },
          { isRead: true }
        ]
      }
    });

    console.log(`✅ ${archivedCount} messages archivés (> ${daysOld} jours)`);
    return archivedCount;
  } catch (error) {
    console.error('Erreur lors de l\'archivage:', error);
    throw error;
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  archiveOldMessages
};

