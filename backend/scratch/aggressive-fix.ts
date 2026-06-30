import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function aggressiveFix() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Attempting aggressive fix for table: brands');
    
    try {
        await connection.query('ALTER TABLE `brands` DISCARD TABLESPACE');
        console.log('Discarded tablespace for brands');
    } catch (e) {
        console.log('Discard tablespace failed (maybe table does not exist in metadata):', e.message);
    }

    try {
        await connection.query('DROP TABLE IF EXISTS `brands`');
        console.log('Dropped table brands');
    } catch (e) {
        console.log('Drop table failed:', e.message);
    }

  } catch (error) {
    console.error('Critical error:', error.message);
  } finally {
    await connection.close();
  }
}

aggressiveFix();
