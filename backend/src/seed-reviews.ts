import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ReviewsService } from './reviews/reviews.service';
import { ReviewStatus } from './reviews/review.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reviewsService = app.get(ReviewsService);

  const productId = 138;
  
  const reviews = [
    { productId, name: 'Jean D.', rating: 5, comment: 'Excellent produit !', status: ReviewStatus.APPROVED },
    { productId, name: 'Marie L.', rating: 4, comment: 'Très pratique.', status: ReviewStatus.APPROVED },
    { productId, name: 'Paul B.', rating: 5, comment: 'Robuste.', status: ReviewStatus.APPROVED },
  ];

  for (const r of reviews) {
    await reviewsService.create(r as any);
    // Note: create sets status to PENDING by default in the service logic.
    // I need to update it to APPROVED.
  }

  // Find the reviews we just created and approve them
  const allReviews = await reviewsService.findAll();
  const targetReviews = allReviews.filter(r => r.productId === productId && r.status === ReviewStatus.PENDING);
  
  for (const r of targetReviews) {
    await reviewsService.updateStatus(r.id, { status: ReviewStatus.APPROVED });
  }

  console.log(`Created and approved ${targetReviews.length} reviews for product ${productId}`);

  await app.close();
}

bootstrap();
