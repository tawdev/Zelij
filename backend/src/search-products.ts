import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const { data: allProducts } = await productsService.findAll(1, 1000);

  const supportMural = allProducts.find(p => p.name.includes('Support mural'));
  const extensionGuidon = allProducts.find(p => p.name.includes('Extension de guidon'));

  console.log('Target Products:');
  if (supportMural) console.log(`ID: ${supportMural.id}, Name: ${supportMural.name}, Price: ${supportMural.price}, OldPrice: ${supportMural.oldPrice}, OnSale: ${supportMural.onSale}`);
  if (extensionGuidon) console.log(`ID: ${extensionGuidon.id}, Name: ${extensionGuidon.name}, Price: ${extensionGuidon.price}, OldPrice: ${extensionGuidon.oldPrice}, OnSale: ${extensionGuidon.onSale}`);

  await app.close();
}

bootstrap();
