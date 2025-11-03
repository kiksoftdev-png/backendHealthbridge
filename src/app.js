const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware de sécurité - Configuré pour permettre CORS depuis toutes les origines
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Désactivé pour permettre CORS
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permet les ressources cross-origin
}));

// Compression des réponses
app.use(compression());

// Configuration CORS - Autorise toutes les origines
app.use(cors({
  origin: true, // Autorise toutes les origines
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (désactivé en développement)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite de 100 requêtes par IP par fenêtre
    message: {
      success: false,
      message: 'Trop de requêtes, veuillez réessayer plus tard'
    }
  });
  app.use('/api/', limiter);
} else {
  console.log('🔓 Rate limiting désactivé en mode développement');
}

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/diseases', require('./routes/diseases'));
app.use('/api/studies', require('./routes/studies'));
app.use('/api/health-zones', require('./routes/healthZones'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/medicaments', require('./routes/medicaments'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/messages', require('./routes/messages'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HealthBridge API est opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;
