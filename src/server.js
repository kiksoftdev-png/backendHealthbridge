const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const { testConnection, syncDatabase } = require('./models');
const setupArchiveJob = require('./config/archiveMessages');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await testConnection();
    
    // Synchroniser les modèles avec la base de données
    await syncDatabase();
    
    // Créer le serveur HTTP
    const server = http.createServer(app);
    
    // Configurer Socket.io
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Middleware Socket.io pour l'authentification
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Token manquant'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        
        if (!user) {
          return next(new Error('Utilisateur non trouvé'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Token invalide'));
      }
    });

    // Gestion des connexions Socket.io
    io.on('connection', (socket) => {
      console.log(`✅ Utilisateur connecté: ${socket.user.name} (ID: ${socket.userId})`);

      // Rejoindre la salle de l'utilisateur
      socket.join(`user:${socket.userId}`);

      // Écouter les messages
      socket.on('send-message', async (data) => {
        try {
          const { receiverId, content } = data;
          
          // Enregistrer le message en base
          const Message = require('./models/Message');
          const message = await Message.create({
            senderId: socket.userId,
            receiverId,
            content
          });

          // Format du message pour l'événement
          const messageData = {
            id: message.id,
            senderId: socket.userId,
            receiverId,
            content,
            sender: {
              id: socket.user.id,
              name: socket.user.name,
              email: socket.user.email,
              avatar: socket.user.avatar
            },
            createdAt: message.createdAt
          };

          // Envoyer le message au destinataire
          io.to(`user:${receiverId}`).emit('new-message', messageData);

          // Envoyer le message confirmé à l'expéditeur
          socket.emit('new-message', messageData);
          
          console.log(`📨 Message envoyé de ${socket.user.name} à utilisateur ${receiverId}`);
        } catch (error) {
          console.error('Erreur lors de l\'envoi du message:', error);
          socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
        }
      });

      // Gestion de la déconnexion
      socket.on('disconnect', () => {
        console.log(`❌ Utilisateur déconnecté: ${socket.user.name} (ID: ${socket.userId})`);
      });
    });

    // Passer io à l'app pour l'utiliser dans les contrôleurs
    app.io = io;

    // Configurer la tâche d'archivage des messages
    setupArchiveJob();
    
    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`
🚀 Serveur HealthBridge démarré avec succès !
📡 Port: ${PORT}
🌍 Environnement: ${process.env.NODE_ENV || 'development'}
📊 Base de données: MySQL
🔗 API disponible sur: http://localhost:${PORT}/api
💬 Socket.io configuré sur le port ${PORT}
      `);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion des signaux de terminaison
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu. Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu. Arrêt du serveur...');
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

startServer();
