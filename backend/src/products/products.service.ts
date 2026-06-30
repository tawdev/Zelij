import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Product } from './product.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto, UpdateProductDto, CalculateAreaDto } from './dto/create-product.dto';
import { generateSlug } from '../utils/slug';

export interface AreaCalculationResult {
  productId: number;
  productName: string;
  width: number;
  height: number;
  numberOfAreas: number;
  totalAreaM2: number;
  wastageApplied: boolean;
  wastagePercent: number;
  wastageM2: number;
  finalAreaM2: number;
  boxCoverageM2: number;
  boxesNeeded: number;
  pricePerM2: number;
  totalPrice: number;
  stockAvailableM2: number;
  stockSufficient: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) { }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: number,
    brandId?: number,
    minPrice?: number,
    maxPrice?: number,
    inStock?: boolean,
    onSale?: boolean,
    ecoFriendly?: boolean,
    sort?: string,
    activeOnly = false,
    isFeatured?: boolean,
  ): Promise<{ data: Product[]; total: number; page: number; totalPages: number }> {
    const qb = this.productRepository.createQueryBuilder('product');

    if (activeOnly) {
      qb.innerJoinAndSelect('product.category', 'category', 'category.isActive = :catIsActive', { catIsActive: true });
    } else {
      qb.leftJoinAndSelect('product.category', 'category');
    }
    qb.leftJoinAndSelect('product.brand', 'brand');

    if (search) {
      qb.andWhere('(product.name LIKE :search OR product.sku LIKE :search)', { search: `%${search}%` });
    }
    if (categoryId) {
      const categoryIds = await this.categoriesService.getDescendantIds(categoryId);
      qb.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds });
    }
    if (brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId });
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (inStock) {
      qb.andWhere('(product.stockM2 > 0 OR product.stock > 0)');
    }
    if (onSale) {
      qb.andWhere('(product.onSale = :onSale OR (product.oldPrice IS NOT NULL AND product.oldPrice > product.price))', { onSale: true });
    }
    if (ecoFriendly) {
      qb.andWhere('product.ecoFriendly = :ecoFriendly', { ecoFriendly: true });
    }
    if (isFeatured !== undefined) {
      qb.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    qb.leftJoin('reviews', 'review', 'review.productId = product.id AND review.status = :status', { status: 'approved' })
      .select(['product', 'category', 'brand'])
      .addSelect('AVG(review.rating)', 'product_ratingAvg')
      .addSelect('COUNT(review.id)', 'product_reviewCount')
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id');

    if (sort === 'priceAsc') {
      qb.orderBy('product.price', 'ASC');
    } else if (sort === 'priceDesc') {
      qb.orderBy('product.price', 'DESC');
    } else if (sort === 'alpha') {
      qb.orderBy('product.name', 'ASC');
    } else if (sort === 'rating') {
      qb.orderBy('product_ratingAvg', 'DESC');
      qb.addOrderBy('product_reviewCount', 'DESC');
    } else if (sort === 'popularity') {
      qb.orderBy('product.stock', 'ASC');
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }
    qb.addOrderBy('product.id', 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const { entities, raw } = await qb.getRawAndEntities();
    const total = await qb.getCount();

    const statsMap = new Map<number, { ratingAvg: number, reviewCount: number }>();
    raw.forEach(r => {
      if (r.product_id) {
        statsMap.set(r.product_id, {
          ratingAvg: parseFloat(r.product_ratingAvg) || 0,
          reviewCount: parseInt(r.product_reviewCount) || 0,
        });
      }
    });

    const data = entities.map(entity => {
      const stats = statsMap.get(entity.id);
      return {
        ...entity,
        ratingAvg: stats ? stats.ratingAvg : 0,
        reviewCount: stats ? stats.reviewCount : 0,
      };
    });

    return { data: data as any, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getStats(): Promise<{
    total: number;
    lowStock: number;
    outOfStock: number;
    active: number;
    maxPrice: number;
  }> {
    const total = await this.productRepository.count();
    const outOfStock = await this.productRepository
      .createQueryBuilder('product')
      .where('(product.stockM2 IS NULL OR product.stockM2 <= 0) AND (product.stock IS NULL OR product.stock <= 0)')
      .getCount();
    const lowStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stockM2 IS NOT NULL AND product.stockM2 > 0 AND product.stockM2 <= 10')
      .orWhere('product.stock IS NOT NULL AND product.stock > 0 AND product.stock <= 10')
      .getCount();

    const maxPriceResult = await this.productRepository
      .createQueryBuilder('product')
      .select('MAX(product.price)', 'max')
      .getRawOne();
    const maxPrice = parseFloat(maxPriceResult?.max) || 0;

    const active = total - outOfStock;
    return { total, lowStock: lowStock - outOfStock, outOfStock, active, maxPrice };
  }

  async create(data: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(data);
    if (!product.slug && product.name) {
      product.slug = await this.generateUniqueSlug(product.name);
    }
    const saved = await this.productRepository.save(product);
    await this.categoriesService.syncActiveStatus();
    return saved;
  }

  async findOne(id: number): Promise<Product | null> {
    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoin('reviews', 'review', 'review.productId = product.id AND review.status = :status', { status: 'approved' })
      .addSelect('AVG(review.rating)', 'product_ratingAvg')
      .addSelect('COUNT(review.id)', 'product_reviewCount')
      .where('product.id = :id', { id })
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id');

    const { entities, raw } = await qb.getRawAndEntities();
    if (entities.length === 0) return null;

    const entity = entities[0];
    const rawItem = raw[0];

    return {
      ...entity,
      ratingAvg: rawItem ? parseFloat(rawItem.product_ratingAvg) || 0 : 0,
      reviewCount: rawItem ? parseInt(rawItem.product_reviewCount) || 0 : 0,
    } as any;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoin('reviews', 'review', 'review.productId = product.id AND review.status = :status', { status: 'approved' })
      .addSelect('AVG(review.rating)', 'product_ratingAvg')
      .addSelect('COUNT(review.id)', 'product_reviewCount')
      .where('product.slug = :slug', { slug })
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id');

    const { entities, raw } = await qb.getRawAndEntities();
    if (entities.length === 0) return null;

    const entity = entities[0];
    const rawItem = raw[0];

    return {
      ...entity,
      ratingAvg: rawItem ? parseFloat(rawItem.product_ratingAvg) || 0 : 0,
      reviewCount: rawItem ? parseInt(rawItem.product_reviewCount) || 0 : 0,
    } as any;
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    if (data.name && data.name !== product.name) {
      data.slug = await this.generateUniqueSlug(data.name);
    }

    await this.productRepository.update(id, data);
    const updatedProduct = await this.findOne(id);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }
    await this.categoriesService.syncActiveStatus();
    return updatedProduct;
  }

  async calculateArea(id: number, dto: CalculateAreaDto): Promise<AreaCalculationResult> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const numberOfAreas = dto.numberOfAreas ?? 1;
    const totalAreaM2 = dto.width * dto.height * numberOfAreas;

    const wastageApplied = dto.wastageApplied ?? true;
    const wastagePercent = wastageApplied ? 0.10 : 0;
    const wastageM2 = totalAreaM2 * wastagePercent;
    const finalAreaM2 = totalAreaM2 + wastageM2;

    const coverage = product.boxCoverageM2 ?? 1;
    const pricePerM2 = product.pricePerM2 ?? product.price;
    const stockAvailableM2 = product.stockM2 ?? product.stock;

    if (coverage <= 0) {
      throw new BadRequestException('Invalid box coverage for this product');
    }

    if (finalAreaM2 < product.minOrderM2) {
      throw new BadRequestException(
        `Minimum order for this product is ${product.minOrderM2} m². Your calculated area is ${finalAreaM2.toFixed(2)} m².`
      );
    }

    const boxesNeeded = Math.ceil(finalAreaM2 / coverage);
    const actualFinalAreaM2 = boxesNeeded * coverage;
    const totalPrice = Math.round(actualFinalAreaM2 * pricePerM2 * 100) / 100;

    const stockSufficient = stockAvailableM2 >= actualFinalAreaM2;

    return {
      productId: product.id,
      productName: product.name,
      width: dto.width,
      height: dto.height,
      numberOfAreas,
      totalAreaM2: Math.round(totalAreaM2 * 100) / 100,
      wastageApplied,
      wastagePercent: wastagePercent * 100,
      wastageM2: Math.round(wastageM2 * 100) / 100,
      finalAreaM2: Math.round(actualFinalAreaM2 * 100) / 100,
      boxCoverageM2: coverage,
      boxesNeeded,
      pricePerM2,
      totalPrice,
      stockAvailableM2,
      stockSufficient,
    };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.productRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.categoriesService.syncActiveStatus();
  }

  async getUniqueTags(): Promise<string[]> {
    const products = await this.productRepository.createQueryBuilder('product')
      .select('product.tags')
      .where('product.tags IS NOT NULL')
      .getMany();

    const allTags = products.reduce((acc, p) => {
      if (p.tags && p.tags.length > 0) {
        return [...acc, ...p.tags];
      }
      return acc;
    }, [] as string[]);

    return Array.from(new Set(allTags)).sort();
  }
}
