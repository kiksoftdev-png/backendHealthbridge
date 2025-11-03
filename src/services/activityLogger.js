const { Activity, Patient, Doctor, Consultation, Hospital, Medicament, Disease, Study, HealthZone, User } = require('../models');

class ActivityLogger {
  /**
   * Vérifie si un utilisateur existe et retourne son ID ou null
   */
  static async getValidUserId(userId) {
    if (!userId) return null;
    
    try {
      const user = await User.findByPk(userId);
      return user ? userId : null;
    } catch (error) {
      console.warn('Utilisateur non trouvé, userId sera null:', userId);
      return null;
    }
  }

  /**
   * Enregistre une activité de création
   */
  static async logCreate(entityType, entity, userId, additionalInfo = {}) {
    try {
      console.log('🔵 Début enregistrement activité CREATE:', { entityType, entityId: entity?.id, userId });
      const description = this.getCreateDescription(entityType, entity);
      
      const validUserId = await this.getValidUserId(userId);
      
      const activity = await Activity.create({
        userId: validUserId,
        action: 'CREATE',
        entityType,
        entityId: entity.id,
        entityName: entity.name || entity.description || `Nouveau ${entityType}`,
        description,
        metadata: {
          ...additionalInfo,
          // Ne pas inclure l'entité complète pour éviter les structures circulaires
          entityId: entity.id
        }
      });
      console.log('✅ Activité CREATE enregistrée avec succès:', activity.id);
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de l\'activité CREATE:', error.message);
      console.error('Stack:', error.stack);
    }
  }

  /**
   * Enregistre une activité de mise à jour
   */
  static async logUpdate(entityType, entityId, oldData, newData, userId, additionalInfo = {}) {
    try {
      const description = this.getUpdateDescription(entityType, newData);
      const validUserId = await this.getValidUserId(userId);
      
      await Activity.create({
        userId: validUserId,
        action: 'UPDATE',
        entityType,
        entityId,
        entityName: newData.name || newData.description || entityType,
        description,
        metadata: {
          ...additionalInfo,
          // Inclure seulement les champs essentiels
          oldData: this.getEssentialFields(oldData),
          newData: this.getEssentialFields(newData)
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité UPDATE:', error);
    }
  }

  /**
   * Enregistre une activité de suppression
   */
  static async logDelete(entityType, entityId, entityName, userId, additionalInfo = {}) {
    try {
      const description = this.getDeleteDescription(entityType, entityName);
      const validUserId = await this.getValidUserId(userId);
      
      await Activity.create({
        userId: validUserId,
        action: 'DELETE',
        entityType,
        entityId,
        entityName: entityName || entityType,
        description,
        metadata: {
          ...additionalInfo
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité DELETE:', error);
    }
  }

  /**
   * Enregistre une activité de consultation/visualisation
   */
  static async logView(entityType, entityId, entityName, userId, additionalInfo = {}) {
    try {
      const validUserId = await this.getValidUserId(userId);
      
      await Activity.create({
        userId: validUserId,
        action: 'VIEW',
        entityType,
        entityId,
        entityName: entityName || entityType,
        description: `Consultation de ${entityType}${entityName ? `: ${entityName}` : ''}`,
        metadata: additionalInfo
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité VIEW:', error);
    }
  }

  /**
   * Enregistre une activité de téléchargement
   */
  static async logDownload(documentType, fileName, userId, additionalInfo = {}) {
    try {
      const validUserId = await this.getValidUserId(userId);
      
      await Activity.create({
        userId: validUserId,
        action: 'DOWNLOAD',
        entityType: 'Document',
        entityName: fileName,
        description: `Téléchargement de ${fileName} (${documentType})`,
        metadata: {
          documentType,
          ...additionalInfo
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité DOWNLOAD:', error);
    }
  }

  /**
   * Enregistre une activité de connexion
   */
  static async logLogin(userId, userName, ipAddress, userAgent) {
    try {
      const validUserId = await this.getValidUserId(userId);
      
      await Activity.create({
        userId: validUserId,
        action: 'LOGIN',
        entityType: 'User',
        entityId: userId,
        entityName: userName,
        description: `Connexion de ${userName}`,
        metadata: {
          ipAddress,
          userAgent
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité LOGIN:', error);
    }
  }

  /**
   * Enregistre une activité de déconnexion
   */
  static async logLogout(userId, userName) {
    try {
      const validUserId = await this.getValidUserId(userId);
      
      await Activity.create({
        userId: validUserId,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: userId,
        entityName: userName,
        description: `Déconnexion de ${userName}`,
        metadata: {}
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité LOGOUT:', error);
    }
  }

  // Méthodes utilitaires

  static getCreateDescription(entityType, entity) {
    switch (entityType) {
      case 'Patient':
        return `Nouveau patient créé: ${entity.name || entity.user?.name || 'Patient'}`;
      case 'Doctor':
        return `Nouveau médecin créé: Dr. ${entity.user?.name || entity.name || 'Médecin'}`;
      case 'Consultation':
        return `Nouvelle consultation créée pour le patient ${entity.patient?.user?.name || 'inconnu'}`;
      case 'Hospital':
        return `Nouvel hôpital créé: ${entity.name}`;
      case 'Medicament':
        return `Nouveau médicament ajouté: ${entity.name}`;
      case 'Prescription':
        return `Nouvelle prescription ajoutée: ${entity.medication}`;
      case 'Disease':
        return `Nouvelle maladie enregistrée: ${entity.name}`;
      case 'Study':
        return `Nouvelle étude enregistrée: ${entity.title}`;
      case 'HealthZone':
        return `Nouvelle zone de santé créée: ${entity.name}`;
      default:
        return `Nouveau ${entityType} créé`;
    }
  }

  static getUpdateDescription(entityType, entity) {
    switch (entityType) {
      case 'Patient':
        return `Patient mis à jour: ${entity.name || entity.user?.name || 'Patient'}`;
      case 'Doctor':
        return `Médecin mis à jour: Dr. ${entity.user?.name || entity.name || 'Médecin'}`;
      case 'Consultation':
        return `Consultation modifiée pour le patient ${entity.patient?.user?.name || 'inconnu'}`;
      case 'Hospital':
        return `Hôpital mis à jour: ${entity.name}`;
      case 'Medicament':
        return `Médicament mis à jour: ${entity.name}`;
      case 'Prescription':
        return `Prescription modifiée: ${entity.medication}`;
      default:
        return `${entityType} mis à jour`;
    }
  }

  static getDeleteDescription(entityType, entityName) {
    return `${entityType} supprimé${entityName ? `: ${entityName}` : ''}`;
  }

  static getDifferences(oldData, newData) {
    const changes = {};
    for (const key in newData) {
      if (oldData[key] !== newData[key] && key !== 'updatedAt' && key !== 'createdAt') {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }
    return changes;
  }

  static sanitizeEntity(entity) {
    if (!entity) return null;
    const sanitized = { ...entity };
    // Retirer les données sensibles
    delete sanitized.password;
    delete sanitized.token;
    return sanitized;
  }

  /**
   * Extrait les champs essentiels d'une entité sans références circulaires
   */
  static getEssentialFields(data) {
    if (!data) return null;
    
    // Si c'est un objet Sequelize, convertir en JSON
    const plainData = data.toJSON ? data.toJSON() : data;
    
    // Créer un nouvel objet avec seulement les champs primitifs
    const essentialFields = {};
    for (const [key, value] of Object.entries(plainData)) {
      // Ignorer les champs avec structures complexes (objets imbriqués, arrays, etc.)
      if (value === null || value === undefined) continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        essentialFields[key] = value;
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        // Tableau de chaînes simples
        essentialFields[key] = value;
      } else if (key === 'id' || key === 'name' || key === 'userId' || key === 'email') {
        essentialFields[key] = value;
      }
    }
    
    return essentialFields;
  }

  /**
   * Enregistre une activité générique (pour le middleware)
   */
  static async logActivity(activityData) {
    try {
      const validUserId = await this.getValidUserId(activityData.userId);
      
      await Activity.create({
        userId: validUserId,
        action: activityData.action,
        entityType: activityData.entityType,
        entityId: activityData.entityId,
        entityName: activityData.entityName,
        description: activityData.description,
        metadata: activityData.metadata || {}
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    }
  }

  /**
   * Récupère le nom de l'entité selon son type
   */
  static async getEntityName(entityType, entityId) {
    try {
      let entity;
      switch (entityType) {
        case 'Patient':
          entity = await Patient.findByPk(entityId, { include: [{ model: User, as: 'user' }] });
          return entity?.user?.name || entity?.name || 'Patient';
        case 'Doctor':
          entity = await Doctor.findByPk(entityId, { include: [{ model: User, as: 'user' }] });
          return entity?.user?.name || 'Médecin';
        case 'Consultation':
          entity = await Consultation.findByPk(entityId);
          return `Consultation #${entityId}`;
        case 'Hospital':
          entity = await Hospital.findByPk(entityId);
          return entity?.name || 'Hôpital';
        case 'Medicament':
          entity = await Medicament.findByPk(entityId);
          return entity?.name || 'Médicament';
        case 'Disease':
          entity = await Disease.findByPk(entityId);
          return entity?.name || 'Maladie';
        case 'Study':
          entity = await Study.findByPk(entityId);
          return entity?.title || 'Étude';
        case 'HealthZone':
          entity = await HealthZone.findByPk(entityId);
          return entity?.name || 'Zone de santé';
        default:
          return entityType;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du nom de l\'entité:', error);
      return entityType;
    }
  }
}

module.exports = ActivityLogger;

