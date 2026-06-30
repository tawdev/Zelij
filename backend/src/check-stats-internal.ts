import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const product = await productsService.findOne(138);
  console.log('Final Result for 138:', product);

  await app.close();
}

bootstrap();
