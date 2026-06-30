import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const { data: allProducts } = await productsService.findAll(1, 1000);

  const missedPromos = allProducts.filter(p => p.oldPrice && Number(p.oldPrice) > Number(p.price) && !p.onSale);

  console.log('Products with oldPrice > price but onSale is false:');
  missedPromos.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, OldPrice: ${p.oldPrice}`);
  });

  await app.close();
}

bootstrap();
