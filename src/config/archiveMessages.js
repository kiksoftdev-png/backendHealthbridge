const cron = require('node-cron');
const { archiveOldMessages } = require('../controllers/messagesController');

// Tâche cron pour archiver les messages anciens
// Exécution quotidienne à 2h00 du matin
const setupArchiveJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Début de l\'archivage des messages anciens...');
    try {
      await archiveOldMessages(30); // Archiver les messages lus de plus de 30 jours
      console.log('✅ Archivage terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage:', error);
    }
  });

  console.log('📅 Tâche d\'archivage configurée (quotidienne à 2h00)');
};

module.exports = setupArchiveJob;

