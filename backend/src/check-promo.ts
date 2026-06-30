import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const { data: onSaleProducts } = await productsService.findAll(1, 100, undefined, undefined, undefined, undefined, undefined, undefined, true);

  console.log('Products with onSale = true:');
  onSaleProducts.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, OldPrice: ${p.oldPrice}, OnSale: ${p.onSale}`);
  });

  await app.close();
}

bootstrap();
