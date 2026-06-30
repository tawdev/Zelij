const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const brandsData = [
    { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg" },
    { name: "Dualtron", logo: "https://www.dualtron.fr/img/cms/Logo%20Dualtron.png" },
    { name: "Segway", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Segway_Logo.svg/1200px-Segway_Logo.svg.png" },
    { name: "Ninebot", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Ninebot_Logo.png" },
    { name: "Kaabo", logo: "https://www.kaabo.com/wp-content/uploads/2021/04/logo.png" },
    { name: "Vsett", logo: "https://vsett.com/wp-content/uploads/2021/03/vsett_logo.png" },
    { name: "E-Twow", logo: "https://e-twow.com/wp-content/uploads/2019/06/etwow-logo.png" },
    { name: "Inmotion", logo: "https://www.inmotionworld.com/skin/frontend/default/inmotion/images/logo.png" },
    { name: "Nami", logo: "https://nami-electric.com/wp-content/uploads/2021/01/logo-nami.png" },
    { name: "Zero", logo: "https://zeroscoter.com/wp-content/uploads/2019/12/Zero-Scooter-Logo.png" },
    { name: "Kryptonite", logo: "https://www.kryptonitelock.com/content/dam/kryptonite/logos/kryptonite-logo.png" },
    { name: "Bosch", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/1280px-Bosch-logo.svg.png" },
    { name: "WildMan", logo: "https://ae01.alicdn.com/kf/H7d5c5f4b4b4b4b4b4b4b4b4b4b4b4b4bJ.jpg" },
    { name: "Cst", logo: "https://www.csttires.com/wp-content/uploads/2018/08/cst-logo.png" },
    { name: "Nut", logo: "https://nutt-brake.com/wp-content/uploads/2020/05/logo.png" }
];

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'droguerie_db',
    });

    console.log('Connected to database for Brands seeding.');

    try {
        for (const brand of brandsData) {
            const [existing] = await connection.execute('SELECT id FROM brands WHERE name = ?', [brand.name]);
            
            if (existing.length === 0) {
                console.log(`Adding brand: ${brand.name}`);
                await connection.execute(
                    'INSERT INTO brands (name, logoUrl, isActive) VALUES (?, ?, ?)',
                    [brand.name, brand.logo, true]
                );
            } else {
                console.log(`Brand ${brand.name} already exists, updating logo.`);
                await connection.execute(
                    'UPDATE brands SET logoUrl = ? WHERE name = ?',
                    [brand.logo, brand.name]
                );
            }
        }
        console.log('Brands seeding completed successfully!');
    } catch (error) {
        console.error('Error during brands seeding:', error);
    } finally {
        await connection.end();
    }
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
