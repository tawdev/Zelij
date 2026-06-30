import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { generateSlug } from '../utils/slug';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productRepository = app.get<Repository<Product>>(getRepositoryToken(Product));

  console.log('🚀 Migrating product slugs...');

  const products = await productRepository.find();
  
  for (const product of products) {
    if (!product.slug) {
      let baseSlug = generateSlug(product.name);
      let slug = baseSlug;
      let counter = 1;
      
      // Handle potential duplicates
      while (await productRepository.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      product.slug = slug;
      await productRepository.save(product);
      console.log(`✅ Updated: ${product.name} -> ${product.slug}`);
    } else {
      console.log(`⏭️ Skipped (already has slug): ${product.name}`);
    }
  }

  console.log('✨ Migration completed!');
  await app.close();
}

bootstrap();
