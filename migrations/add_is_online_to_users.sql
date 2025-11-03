-- Migration pour ajouter le champ isOnline à la table users
-- Ce fichier ajoute un champ pour indiquer si l'utilisateur est en ligne

ALTER TABLE `users` 
ADD COLUMN `isOnline` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Statut en ligne (1=en ligne, 0=hors ligne)',
ADD COLUMN `lastActiveAt` DATETIME NULL DEFAULT NULL COMMENT 'Dernière activité de l\'utilisateur';

-- Index pour améliorer les performances des requêtes de recherche d'utilisateurs en ligne
CREATE INDEX `idx_isOnline` ON `users` (`isOnline`);
CREATE INDEX `idx_lastActiveAt` ON `users` (`lastActiveAt`);
