import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { Brand } from '../brands/brand.entity';

export enum PricingUnit {
    PER_SQUARE_METER = 'per_square_meter',
    PER_PIECE = 'per_piece',
}

export enum Finishing {
    GLAZED_HIGH_GLOSS = 'glazed_high_gloss',
    SEMI_MATTE = 'semi_matte',
    NATURAL_UNGLAZED = 'natural_unglazed',
    MATTE = 'matte',
    POLISHED = 'polished',
}

export enum Shape {
    SQUARE = 'square',
    BEJMAT = 'bejmat',
    STAR_CROSS = 'star_cross',
    DIAMOND = 'diamond',
    HEXAGON = 'hexagon',
    RECTANGLE = 'rectangle',
    CUSTOM = 'custom',
}

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true, nullable: true })
    slug: string;

    @Column({ nullable: true })
    sku: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    oldPrice: number;

    @Column({ default: 0 })
    stock: number;

    @Column({ nullable: true })
    imageUrl: string;

    @Column('simple-json', { nullable: true })
    imageUrls: string[];

    @ManyToOne(() => Category, { nullable: true, eager: false })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @ManyToOne(() => Brand, { nullable: true, eager: false })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @Column({ nullable: true })
    categoryId: number;

    @Column({ nullable: true })
    brandId: number;

    @Column({ default: false })
    onSale: boolean;

    @Column({ default: false })
    ecoFriendly: boolean;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: false })
    isFeatured: boolean;

    @Column({ nullable: true })
    finishing: string;

    @Column({ nullable: true })
    shape: string;

    @Column('decimal', { precision: 4, scale: 1, nullable: true })
    thickness: number;

    @Column({ default: PricingUnit.PER_SQUARE_METER })
    pricingUnit: string;

    @Column('decimal', { precision: 6, scale: 1, nullable: true })
    formatWidth: number;

    @Column('decimal', { precision: 6, scale: 1, nullable: true })
    formatHeight: number;

    @Column('decimal', { precision: 8, scale: 2, nullable: true })
    boxCoverageM2: number;

    @Column('decimal', { precision: 8, scale: 2, nullable: true })
    boxWeight: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    stockM2: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    pricePerM2: number;

    @Column('decimal', { precision: 8, scale: 2, default: 1.00 })
    minOrderM2: number;

    @CreateDateColumn()
    createdAt: Date;
}
