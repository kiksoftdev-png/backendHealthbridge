const { syncDatabase } = require('../models');

const migrate = async () => {
  try {
    console.log('🔄 Début de la migration de la base de données...');
    await syncDatabase();
    console.log('✅ Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

migrate();
