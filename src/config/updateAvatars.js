const { User } = require('../models');

const updateAvatars = async () => {
  try {
    console.log('🔄 Mise à jour des avatars...');

    // Avatars par défaut valides
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    ];

    // Récupérer tous les utilisateurs
    const users = await User.findAll();
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const avatarIndex = i % defaultAvatars.length;
      
      await user.update({
        avatar: defaultAvatars[avatarIndex]
      });
      
      console.log(`✅ Avatar mis à jour pour ${user.name}`);
    }

    console.log('🎉 Tous les avatars ont été mis à jour avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des avatars:', error);
  }
};

// Exécuter si le script est appelé directement
if (require.main === module) {
  updateAvatars()
    .then(() => {
      console.log('Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

module.exports = updateAvatars;
