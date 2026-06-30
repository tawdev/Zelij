import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function fixDatabase() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Attempting to drop problematic table: brands');
    await connection.query('DROP TABLE IF EXISTS `brands`');
    console.log('Successfully dropped table brands (if it existed)');
  } catch (error) {
    console.error('Failed to drop table brands:', error.message);
    console.log('Trying manual drop if file exists...');
    try {
        // Sometimes only this works if metadata is corrupted
        await connection.query('DROP TABLE `brands`');
    } catch (e) {
        console.error('Manual drop failed:', e.message);
    }
  } finally {
    await connection.close();
  }
}

fixDatabase();
