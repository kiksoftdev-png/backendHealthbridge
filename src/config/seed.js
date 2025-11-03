const { User, Doctor, Patient, Disease, Study } = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Début du seeding de la base de données...');

    // Créer des utilisateurs de test
    const user1 = await User.create({
      name: 'Dr. Jean Mukamba',
      email: 'jean.mukamba@healthbridge.cd',
      password: 'password123',
      role: 'doctor',
      phone: '+243 81 234 5678',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    });

    const user2 = await User.create({
      name: 'Dr. Marie Kabongo',
      email: 'marie.kabongo@healthbridge.cd',
      password: 'password123',
      role: 'doctor',
      phone: '+243 99 876 5432',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    });

    const user3 = await User.create({
      name: 'Admin HealthBridge',
      email: 'admin@healthbridge.cd',
      password: 'admin123',
      role: 'admin',
      phone: '+243 81 000 0000'
    });

    const user4 = await User.create({
      name: 'Patient Test',
      email: 'patient@test.cd',
      password: 'password123',
      role: 'patient',
      phone: '+243 81 111 1111'
    });

    const users = [user1, user2, user3, user4];

    // Créer des profils de médecins
    await Doctor.bulkCreate([
      {
        userId: users[0].id,
        specialty: 'Cardiologie',
        hospital: 'Hôpital Général de Kinshasa',
        zone: 'Kinshasa',
        experience: '15 ans',
        rating: 4.8,
        isOnline: true,
        licenseNumber: 'MED001',
        qualifications: 'MD, Spécialiste en Cardiologie',
        languages: ['Français', 'Lingala', 'Anglais']
      },
      {
        userId: users[1].id,
        specialty: 'Pédiatrie',
        hospital: 'Centre Hospitalier de Lubumbashi',
        zone: 'Lubumbashi',
        experience: '12 ans',
        rating: 4.9,
        isOnline: false,
        licenseNumber: 'MED002',
        qualifications: 'MD, Spécialiste en Pédiatrie',
        languages: ['Français', 'Swahili', 'Anglais']
      }
    ], { ignoreDuplicates: true });

    // Créer des profils de patients
    await Patient.bulkCreate([
      {
        userId: users[3].id,
        age: 45,
        gender: 'M',
        bloodType: 'O+',
        emergencyContact: 'Marie Test',
        emergencyPhone: '+243 99 111 1111',
        medicalHistory: 'Hypertension, Diabète type 2',
        allergies: 'Pénicilline',
        currentMedications: 'Métformine, Amlodipine'
      }
    ], { ignoreDuplicates: true });

    // Créer des maladies
    await Disease.bulkCreate([
      {
        name: 'Malaria',
        description: 'Maladie infectieuse transmise par les moustiques du genre Anopheles',
        symptoms: ['Fièvre', 'Maux de tête', 'Fatigue', 'Nausées', 'Vomissements'],
        treatment: 'Artémisinine, Quinine, Prévention par moustiquaires',
        prevention: 'Moustiquaires imprégnées, Élimination des gîtes larvaires',
        prevalence: 'Très élevée',
        zone: 'Toutes zones',
        category: 'Maladies infectieuses',
        isContagious: false,
        severity: 'Modérée',
        icd10Code: 'B50'
      },
      {
        name: 'Diabète de type 2',
        description: 'Trouble métabolique caractérisé par une hyperglycémie chronique',
        symptoms: ['Soif excessive', 'Urination fréquente', 'Fatigue', 'Vision floue'],
        treatment: 'Métformine, Insuline, Régime alimentaire, Exercice',
        prevention: 'Régime équilibré, Exercice régulier, Contrôle du poids',
        prevalence: 'Élevée',
        zone: 'Urbain',
        category: 'Maladies métaboliques',
        isContagious: false,
        severity: 'Modérée',
        icd10Code: 'E11'
      },
      {
        name: 'Hypertension artérielle',
        description: 'Élévation chronique de la pression artérielle',
        symptoms: ['Maux de tête', 'Vertiges', 'Essoufflement', 'Douleurs thoraciques'],
        treatment: 'Inhibiteurs de l\'ECA, Diurétiques, Bêta-bloquants',
        prevention: 'Régime pauvre en sel, Exercice, Arrêt du tabac',
        prevalence: 'Élevée',
        zone: 'Toutes zones',
        category: 'Maladies cardiovasculaires',
        isContagious: false,
        severity: 'Modérée',
        icd10Code: 'I10'
      }
    ], { ignoreDuplicates: true });

    // Créer des études
    await Study.bulkCreate([
      {
        title: 'Étude sur la prévalence du paludisme à Kinshasa',
        description: 'Analyse épidémiologique du paludisme dans les zones urbaines de Kinshasa',
        researcherId: users[0].id,
        zone: 'Kinshasa',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        status: 'En cours',
        participants: 500,
        studyType: 'Épidémiologique',
        objectives: 'Évaluer la prévalence du paludisme et identifier les facteurs de risque',
        methodology: 'Étude transversale avec échantillonnage aléatoire',
        funding: 'Ministère de la Santé RDC',
        ethicsApproval: true
      },
      {
        title: 'Impact de la nutrition sur la santé maternelle',
        description: 'Évaluation de l\'impact des programmes nutritionnels sur la santé des femmes enceintes',
        researcherId: users[1].id,
        zone: 'Lubumbashi',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-03-31'),
        status: 'Terminée',
        participants: 300,
        studyType: 'Clinique',
        objectives: 'Mesurer l\'efficacité des suppléments nutritionnels',
        methodology: 'Essai contrôlé randomisé',
        funding: 'OMS',
        ethicsApproval: true
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Seeding de la base de données terminé avec succès !');
    console.log(`👥 ${users.length} utilisateurs créés`);
    console.log('🏥 2 médecins créés');
    console.log('👤 1 patient créé');
    console.log('🦠 3 maladies créées');
    console.log('📊 2 études créées');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
};

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding terminé !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur lors du seeding:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
