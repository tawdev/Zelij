const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const productsData = {
  "Trottinettes Urbaines": [
    { name: "Xiaomi Mi Electric Scooter 3", price: 3500.00, sku: "URB-XIA-3" },
    { name: "Ninebot Segway KickScooter E22E", price: 3200.00, sku: "URB-NIN-E22E" },
    { name: "Dualtron Mini Special", price: 9800.00, sku: "URB-DUA-MINI-S" },
    { name: "E-Twow Booster GT", price: 7200.00, sku: "URB-ETW-BGT" },
    { name: "Inmotion L9", price: 7800.00, sku: "URB-INM-L9" },
    { name: "Xiaomi Essential Lite", price: 2800.00, sku: "URB-XIA-LITE" },
    { name: "Segway Air T15", price: 5900.00, sku: "URB-SEG-T15" },
    { name: "Unagi Model One E500", price: 8500.00, sku: "URB-UNA-E500" },
    { name: "Ninebot Max G30LP", price: 6200.00, sku: "URB-NIN-G30LP" },
    { name: "Xiaomi 1S Edition", price: 3900.00, sku: "URB-XIA-1S" }
  ],
  "Trottinettes Tout-Terrain": [
    { name: "Dualtron Thunder 2", price: 42000.00, sku: "TT-DUA-TH2" },
    { name: "Kaabo Wolf Warrior 11 GT", price: 31000.00, sku: "TT-KAA-WW11-GT" },
    { name: "Vsett 11+ Super", price: 34000.00, sku: "TT-VSE-11PS" },
    { name: "Nami Burn-e 2 Max", price: 45000.00, sku: "TT-NAMI-B2M" },
    { name: "Zero 10X Limited", price: 17500.00, sku: "TT-ZER-10X-L" },
    { name: "Dualtron Achilleus", price: 34000.00, sku: "TT-DUA-ACH" },
    { name: "Kaabo Wolf King GT", price: 38000.00, sku: "TT-KAA-WKING" },
    { name: "Bronco Xtreme 11", price: 29000.00, sku: "TT-BRO-X11" },
    { name: "Teverun Fighter Eleven", price: 27000.00, sku: "TT-TEV-F11" },
    { name: "Dualtron Storm Up", price: 48000.00, sku: "TT-DUA-STORM" }
  ],
  "Pièces Détachées": [
    { name: "Pneu tout-terrain 10 pouces", price: 250.00, sku: "PIE-PNEU-10TT" },
    { name: "Chambre à air renforcée 8.5\"", price: 80.00, sku: "PIE-CHAM-85" },
    { name: "Plaquettes de frein Semi-Metal", price: 120.00, sku: "PIE-FREIN-PL" },
    { name: "Batterie Xiaomi M365 (36V 7.8Ah)", price: 1200.00, sku: "PIE-BAT-XIA" },
    { name: "Chargeur rapide 58.8V 5A GX16", price: 850.00, sku: "PIE-CHAR-RAP" },
    { name: "Contrôleur 48V 25A Zero 10X", price: 950.00, sku: "PIE-CTRL-48V" },
    { name: "Disque de frein 140mm Inox", price: 180.00, sku: "PIE-DISQ-140" },
    { name: "Moteur 350W Xiaomi Pro 2", price: 1100.00, sku: "PIE-MOT-350" },
    { name: "Garde-boue arrière renforcé", price: 150.00, sku: "PIE-GARDE-AR" },
    { name: "Potence renforcée Dualtron", price: 650.00, sku: "PIE-POT-DUA" }
  ],
  "Équipements de Sécurité": [
    { name: "Casque Intégral VTT Enduro", price: 850.00, sku: "SEC-CASQ-INT" },
    { name: "Genouillères articulées Pro", price: 450.00, sku: "SEC-GEN-PRO" },
    { name: "Gants cohésifs homologués CE", price: 320.00, sku: "SEC-GANT-CE" },
    { name: "Gilet réfléchissant LED", price: 180.00, sku: "SEC-GIL-LED" },
    { name: "Klaxon électronique 120dB", price: 150.00, sku: "SEC-KLAX-120" },
    { name: "Rétroviseur grand angle", price: 90.00, sku: "SEC-RETR-GA" },
    { name: "Coudières Protection Impact", price: 380.00, sku: "SEC-COUD-IMP" },
    { name: "Veste de protection Dorsale", price: 1200.00, sku: "SEC-VEST-DOR" },
    { name: "Eclairage LED supplémentaire", price: 220.00, sku: "SEC-LED-SUP" },
    { name: "Sac de premiers secours compact", price: 140.00, sku: "SEC-MEDI-KIT" }
  ],
  "Accessoires Pratiques": [
    { name: "Sacoche étanche WildMan 3L", price: 280.00, sku: "ACC-SAC-WM" },
    { name: "Support Smartphone QuadLock", price: 450.00, sku: "ACC-SUP-QL" },
    { name: "Pompe électrique Xiaomi 1S", price: 490.00, sku: "ACC-POMP-XIA1S" },
    { name: "Sangle de transport universelle", price: 120.00, sku: "ACC-SANG-UNI" },
    { name: "Antivol U Kryptonite Evolution", price: 850.00, sku: "ACC-ANTI-KRY" },
    { name: "Crochet pour sac Aluminium", price: 65.00, sku: "ACC-CROC-SAC" },
    { name: "Extension de guidon Carbone", price: 190.00, sku: "ACC-EXT-GUID" },
    { name: "Sac de transport pour trottinette", price: 350.00, sku: "ACC-SAC-TRANS" },
    { name: "Poignée de transport sangle", price: 95.00, sku: "ACC-POIG-SANG" },
    { name: "Support mural pour trottinette", price: 180.00, sku: "ACC-SUP-MUR" }
  ]
};

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'droguerie_db',
  });

  console.log('Connected to database for Scooters Advanced seeding.');

  const categoryMap = {}; 
  const [existingCategories] = await connection.execute('SELECT id, name FROM categories');
  
  for (const cat of existingCategories) {
    categoryMap[cat.name] = cat.id;
  }

  const targetCategoryNames = Object.keys(productsData);
  let productsCount = 0;
  
  for (const name of targetCategoryNames) {
    if (!categoryMap[name]) {
      console.log(`Creating category: ${name}`);
      const [res] = await connection.execute('INSERT INTO categories (name, isActive) VALUES (?, ?)', [name, true]);
      categoryMap[name] = res.insertId;
    } else {
      console.log(`Category exists: ${name} (ID: ${categoryMap[name]})`);
    }
  }

  for (const [catName, products] of Object.entries(productsData)) {
    const categoryId = categoryMap[catName];
    console.log(`Inserting ${products.length} products for ${catName}...`);
    
    for (const p of products) {
      let imgSearch = 'electric scooter';
      if (catName === 'Pièces Détachées') {
        imgSearch = 'scooter parts wheel tire';
      } else if (catName === 'Équipements de Sécurité') {
        imgSearch = 'helmet knee pads riding gear';
      } else if (catName === 'Accessoires Pratiques') {
        imgSearch = 'bike accessories phone mount lock';
      }

      const thumbUrl = `https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400&q=${encodeURIComponent(imgSearch)}`;

      await connection.execute(
        'INSERT INTO products (name, sku, price, stock, categoryId, imageUrl, onSale) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.sku, p.price, Math.floor(Math.random() * 50) + 5, categoryId, thumbUrl, Math.random() > 0.8]
      );
      productsCount++;
    }
  }

  console.log(`Successfully added ${productsCount} products across ${targetCategoryNames.length} categories!`);
  await connection.end();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
