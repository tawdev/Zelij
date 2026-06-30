import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsEnum, Min } from 'class-validator';
import { PricingUnit, Finishing, Shape } from '../product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsNumber()
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  brandId?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  onSale?: boolean;

  @IsBoolean()
  @IsOptional()
  ecoFriendly?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  finishing?: string;

  @IsString()
  @IsOptional()
  shape?: string;

  @IsNumber()
  @IsOptional()
  thickness?: number;

  @IsString()
  @IsOptional()
  pricingUnit?: string;

  @IsNumber()
  @IsOptional()
  formatWidth?: number;

  @IsNumber()
  @IsOptional()
  formatHeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  boxCoverageM2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  boxWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockM2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerM2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderM2?: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  oldPrice?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsOptional()
  brandId?: number;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  onSale?: boolean;

  @IsBoolean()
  @IsOptional()
  ecoFriendly?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  finishing?: string;

  @IsString()
  @IsOptional()
  shape?: string;

  @IsNumber()
  @IsOptional()
  thickness?: number;

  @IsString()
  @IsOptional()
  pricingUnit?: string;

  @IsNumber()
  @IsOptional()
  formatWidth?: number;

  @IsNumber()
  @IsOptional()
  formatHeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  boxCoverageM2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  boxWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stockM2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerM2?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderM2?: number;
}

export class CalculateAreaDto {
  @IsNumber()
  @Min(0.01)
  width: number;

  @IsNumber()
  @Min(0.01)
  height: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  numberOfAreas?: number;

  @IsBoolean()
  @IsOptional()
  wastageApplied?: boolean;
}
