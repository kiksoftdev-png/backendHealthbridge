const puppeteer = require('puppeteer');

class PDFService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async generateHealthZonePDF(healthZoneData) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // Créer le HTML pour le PDF
      const html = this.generateHealthZoneHTML(healthZoneData);

      // Charger le HTML avec timeout plus long
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // Attendre un peu pour que le contenu se stabilise
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Générer le PDF avec format optimisé
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span>HealthBridge - Système de Gestion des Zones de Santé</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
          </div>
        `
      });

      return pdf;
    } finally {
      await page.close();
    }
  }

  generateHealthZoneHTML(healthZone) {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Fonctionnelle':
          return '#10b981';
        case 'Partiellement fonctionnelle':
          return '#f59e0b';
        case 'Non fonctionnelle':
          return '#ef4444';
        case 'En construction':
          return '#3b82f6';
        default:
          return '#6b7280';
      }
    };

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport Zone de Santé - ${healthZone.name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .zone-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .zone-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 15px;
          }
          
          .zone-meta {
            display: flex;
            gap: 30px;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .meta-label {
            font-weight: 600;
            color: #64748b;
          }
          
          .meta-value {
            color: #1e293b;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            color: white;
            background-color: ${getStatusColor(healthZone.status)};
          }
          
          .section {
            margin-bottom: 35px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3b82f6;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-icon {
            font-size: 24px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
          }
          
          .info-card h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-item:last-child {
            border-bottom: none;
          }
          
          .info-label {
            font-weight: 500;
            color: #64748b;
          }
          
          .info-value {
            font-weight: 600;
            color: #1e293b;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .stat-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .stat-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }
          
          .infrastructure .stat-card:nth-child(1) .stat-number { color: #3b82f6; }
          .infrastructure .stat-card:nth-child(2) .stat-number { color: #10b981; }
          .infrastructure .stat-card:nth-child(3) .stat-number { color: #8b5cf6; }
          .infrastructure .stat-card:nth-child(4) .stat-number { color: #f59e0b; }
          
          .personnel .stat-card:nth-child(1) .stat-number { color: #ef4444; }
          .personnel .stat-card:nth-child(2) .stat-number { color: #3b82f6; }
          .personnel .stat-card:nth-child(3) .stat-number { color: #ec4899; }
          .personnel .stat-card:nth-child(4) .stat-number { color: #10b981; }
          
          .budget-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #0ea5e9;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
          }
          
          .budget-amount {
            font-size: 28px;
            font-weight: bold;
            color: #0369a1;
            margin-bottom: 5px;
          }
          
          .budget-label {
            font-size: 16px;
            color: #0c4a6e;
            font-weight: 500;
          }
          
          .contact-section {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .contact-item:last-child {
            border-bottom: none;
          }
          
          .contact-icon {
            font-size: 18px;
            width: 24px;
            text-align: center;
          }
          
          .contact-label {
            font-weight: 600;
            color: #64748b;
            min-width: 120px;
          }
          
          .contact-value {
            color: #1e293b;
            font-weight: 500;
          }
          
          .notes-section {
            background: #fefce8;
            border: 1px solid #facc15;
            border-radius: 12px;
            padding: 25px;
          }
          
          .notes-text {
            color: #a16207;
            line-height: 1.7;
            font-style: italic;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          
          @media print {
            .header {
              background: #3b82f6 !important;
              -webkit-print-color-adjust: exact;
            }
            
            .stat-card {
              box-shadow: none !important;
              border: 1px solid #e2e8f0 !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- En-tête -->
        <div class="header">
          <h1>RAPPORT DÉTAILLÉ</h1>
          <p>Zone de Santé - République Démocratique du Congo</p>
        </div>

        <!-- Informations de la zone -->
        <div class="zone-info">
          <h2 class="zone-title">${healthZone.name}</h2>
          <div class="zone-meta">
            <div class="meta-item">
              <span class="meta-label">Code:</span>
              <span class="meta-value">${healthZone.code}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Statut:</span>
              <span class="status-badge">${healthZone.status}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Généré le:</span>
              <span class="meta-value">${new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        <!-- Localisation -->
        <div class="section">
          <h3 class="section-title">
            <span class="section-icon">[GPS]</span>
            Localisation
          </h3>
          <div class="grid">
            <div class="info-card">
              <h4>Géographie</h4>
              <div class="info-item">
                <span class="info-label">Province:</span>
                <span class="info-value">${healthZone.province}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Territoire:</span>
                <span class="info-value">${healthZone.territory}</span>
              </div>
              ${healthZone.sector ? `
              <div class="info-item">
                <span class="info-label">Secteur:</span>
                <span class="info-value">${healthZone.sector}</span>
              </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">Chef-lieu:</span>
                <span class="info-value">${healthZone.chiefTown}</span>
              </div>
            </div>
            <div class="info-card">
              <h4>Démographie</h4>
              ${healthZone.population ? `
              <div class="info-item">
                <span class="info-label">Population:</span>
                <span class="info-value">${healthZone.population.toLocaleString()} hab.</span>
              </div>
              ` : ''}
              ${healthZone.area ? `
              <div class="info-item">
                <span class="info-label">Superficie:</span>
                <span class="info-value">${healthZone.area} km²</span>
              </div>
              ` : ''}
              ${healthZone.coordinates ? `
              <div class="info-item">
                <span class="info-label">Coordonnées GPS:</span>
                <span class="info-value">${healthZone.coordinates.latitude}, ${healthZone.coordinates.longitude}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Infrastructures de santé -->
        <div class="section infrastructure">
          <h3 class="section-title">
            <span class="section-icon">[SANTE]</span>
            Infrastructures de Santé
          </h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${healthZone.healthCenters || 0}</div>
              <div class="stat-label">Centres de santé</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${healthZone.hospitals || 0}</div>
              <div class="stat-label">Hôpitaux</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${healthZone.healthPosts || 0}</div>
              <div class="stat-label">Postes de santé</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${(healthZone.healthCenters || 0) + (healthZone.hospitals || 0) + (healthZone.healthPosts || 0)}</div>
              <div class="stat-label">Total infrastructures</div>
            </div>
          </div>
        </div>

        <!-- Personnel de santé -->
        <div class="section personnel">
          <h3 class="section-title">
            <span class="section-icon">[EQUIPE]</span>
            Personnel de Santé
          </h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${healthZone.doctors || 0}</div>
              <div class="stat-label">Médecins</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${healthZone.nurses || 0}</div>
              <div class="stat-label">Infirmiers</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${healthZone.midwives || 0}</div>
              <div class="stat-label">Sages-femmes</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${healthZone.healthWorkers || 0}</div>
              <div class="stat-label">Agents de santé</div>
            </div>
          </div>
        </div>

        <!-- Budget -->
        ${healthZone.budget ? `
        <div class="section">
          <h3 class="section-title">
            <span class="section-icon">[BUDGET]</span>
            Budget
          </h3>
          <div class="budget-section">
            <div class="budget-amount">$${healthZone.budget.toLocaleString()} USD</div>
            <div class="budget-label">Budget annuel</div>
          </div>
        </div>
        ` : ''}

        <!-- Contact -->
        ${(healthZone.contactPerson || healthZone.contactPhone || healthZone.contactEmail) ? `
        <div class="section">
          <h3 class="section-title">
            <span class="section-icon">[CONTACT]</span>
            Contact
          </h3>
          <div class="contact-section">
            ${healthZone.contactPerson ? `
            <div class="contact-item">
              <span class="contact-icon">[USER]</span>
              <span class="contact-label">Personne de contact:</span>
              <span class="contact-value">${healthZone.contactPerson}</span>
            </div>
            ` : ''}
            ${healthZone.contactPhone ? `
            <div class="contact-item">
              <span class="contact-icon">[PHONE]</span>
              <span class="contact-label">Téléphone:</span>
              <span class="contact-value">${healthZone.contactPhone}</span>
            </div>
            ` : ''}
            ${healthZone.contactEmail ? `
            <div class="contact-item">
              <span class="contact-icon">[EMAIL]</span>
              <span class="contact-label">Email:</span>
              <span class="contact-value">${healthZone.contactEmail}</span>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Évaluations -->
        ${(healthZone.lastEvaluation || healthZone.nextEvaluation) ? `
        <div class="section">
          <h3 class="section-title">
            <span class="section-icon">[CALENDAR]</span>
            Évaluations
          </h3>
          <div class="info-card">
            ${healthZone.lastEvaluation ? `
            <div class="info-item">
              <span class="info-label">Dernière évaluation:</span>
              <span class="info-value">${new Date(healthZone.lastEvaluation).toLocaleDateString('fr-FR')}</span>
            </div>
            ` : ''}
            ${healthZone.nextEvaluation ? `
            <div class="info-item">
              <span class="info-label">Prochaine évaluation:</span>
              <span class="info-value">${new Date(healthZone.nextEvaluation).toLocaleDateString('fr-FR')}</span>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Notes -->
        ${healthZone.notes ? `
        <div class="section">
          <h3 class="section-title">
            <span class="section-icon">[NOTES]</span>
            Notes et Observations
          </h3>
          <div class="notes-section">
            <p class="notes-text">${healthZone.notes}</p>
          </div>
        </div>
        ` : ''}

        <!-- Pied de page -->
        <div class="footer">
          <p>HealthBridge - Système de Gestion des Zones de Santé</p>
          <p>Rapport généré le ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFService();
