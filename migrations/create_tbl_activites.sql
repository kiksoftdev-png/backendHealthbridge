-- Migration pour créer la table tbl_activites
-- Ce fichier crée la table des activités pour le journal des actions de la plateforme

CREATE TABLE IF NOT EXISTS `tbl_activites` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `userId` INT(11) NULL DEFAULT NULL COMMENT 'ID de l\'utilisateur qui a effectué l\'action',
  `action` VARCHAR(50) NOT NULL COMMENT 'Type d\'action (CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, DOWNLOAD)',
  `entityType` VARCHAR(50) NOT NULL COMMENT 'Type d\'entité (Patient, Doctor, Consultation, Hospital, Medicament, etc.)',
  `entityId` INT(11) NULL DEFAULT NULL COMMENT 'ID de l\'entité concernée',
  `entityName` VARCHAR(200) NULL DEFAULT NULL COMMENT 'Nom de l\'entité (ex: nom du patient, nom du médecin)',
  `description` TEXT NULL DEFAULT NULL COMMENT 'Description détaillée de l\'action',
  `ipAddress` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Adresse IP de l\'utilisateur',
  `userAgent` VARCHAR(500) NULL DEFAULT NULL COMMENT 'User agent du navigateur',
  `metadata` JSON NULL DEFAULT NULL COMMENT 'Informations supplémentaires (anciennes valeurs, nouvelles valeurs, etc.)',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date et heure de création de l\'activité',
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_entityType` (`entityType`),
  KEY `idx_entityId` (`entityId`),
  KEY `idx_action` (`action`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_activities_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Journal des activités de la plateforme HealthBridge';

-- Index composé pour améliorer les performances des requêtes de recherche
CREATE INDEX `idx_user_action_date` ON `tbl_activites` (`userId`, `action`, `createdAt`);
CREATE INDEX `idx_entity_type_action` ON `tbl_activites` (`entityType`, `action`, `createdAt`);

