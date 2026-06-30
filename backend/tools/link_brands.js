const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function linkProductsToBrands() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'droguerie_db',
    });

    console.log('Connected to database to link products to brands.');

    try {
        // 1. Get all brands
        const [brands] = await connection.execute('SELECT id, name FROM brands');
        const brandMap = {};
        brands.forEach(b => {
            brandMap[b.name.toLowerCase()] = b.id;
        });

        // 2. Get all products
        const [products] = await connection.execute('SELECT id, name FROM products');

        console.log(`Analyzing ${products.length} products...`);

        let linkedCount = 0;

        for (const product of products) {
            const productName = product.name.toLowerCase();
            let brandIdToLink = null;

            // Try to find a brand name within the product name
            for (const [brandName, id] of Object.entries(brandMap)) {
                if (productName.includes(brandName)) {
                    brandIdToLink = id;
                    break;
                }
            }

            // Fallbacks for specific accessory brands or common terms
            if (!brandIdToLink) {
                if (productName.includes('bosch')) brandIdToLink = brandMap['bosch'];
                else if (productName.includes('kryptonite')) brandIdToLink = brandMap['kryptonite'];
                else if (productName.includes('wildman')) brandIdToLink = brandMap['wildman'];
                else if (productName.includes('cst')) brandIdToLink = brandMap['cst'];
                else if (productName.includes('nut')) brandIdToLink = brandMap['nut'];
            }

            if (brandIdToLink) {
                await connection.execute(
                    'UPDATE products SET brandId = ? WHERE id = ?',
                    [brandIdToLink, product.id]
                );
                linkedCount++;
            }
        }

        console.log(`Successfully linked ${linkedCount} products to their respective brands!`);
    } catch (error) {
        console.error('Error linking products to brands:', error);
    } finally {
        await connection.end();
    }
}

linkProductsToBrands().catch(err => {
    console.error('Process failed:', err);
    process.exit(1);
});
