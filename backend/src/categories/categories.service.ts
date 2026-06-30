import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        private readonly dataSource: DataSource,
    ) { }

    async onModuleInit() {
        // Run initial sync on startup
        try {
            await this.syncActiveStatus();
            console.log('Initial category status sync completed');
        } catch (error) {
            console.error('Failed to sync category status on startup:', error);
        }
    }

    findAll(activeOnly = false): Promise<Category[]> {
        const where = activeOnly ? { isActive: true } : {};
        return this.categoryRepository.find({
            where,
            relations: ['products', 'children', 'parent'],
            order: { name: 'ASC' }
        });
    }

    async count(): Promise<number> {
        return this.categoryRepository.count();
    }

    async findWithProducts(): Promise<Category[]> {
        // Returns categories that have at least one product (direct or via subcategory)
        const rows = await this.dataSource.query(`
            SELECT DISTINCT c.*
            FROM categories c
            WHERE c.isActive = 1
            AND (
                EXISTS (SELECT 1 FROM products p WHERE p.categoryId = c.id)
                OR EXISTS (
                    SELECT 1 FROM products p
                    INNER JOIN categories child ON p.categoryId = child.id
                    WHERE child.parentId = c.id
                )
            )
            ORDER BY c.name ASC
        `);
        return rows as Category[];
    }

    async findOne(id: number): Promise<Category | null> {
        return this.categoryRepository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Category | null> {
        return this.categoryRepository.findOne({ where: { name } });
    }

    async create(data: { name: string; description?: string; isActive?: boolean; parentId?: number }): Promise<Category> {
        const category = this.categoryRepository.create(data);
        const saved = await this.categoryRepository.save(category);
        await this.syncActiveStatus();
        return saved;
    }

    async update(id: number, data: { name?: string; description?: string; isActive?: boolean; parentId?: number }): Promise<Category> {
        const category = await this.findOne(id);
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        Object.assign(category, data);
        const saved = await this.categoryRepository.save(category);
        await this.syncActiveStatus();
        return saved;
    }

    async remove(id: number): Promise<void> {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        await this.syncActiveStatus();
    }

    async syncActiveStatus(): Promise<void> {
        // Fetch all categories with products and children to determine active status
        const categories = await this.categoryRepository.find({
            relations: ['products', 'children']
        });

        const checkHasProducts = (cat: Category): boolean => {
            // Has direct products
            if (cat.products && cat.products.length > 0) return true;
            // Has children that have products (recursive)
            if (cat.children && cat.children.length > 0) {
                return cat.children.some(child => {
                    const fullChild = categories.find(c => c.id === child.id);
                    return fullChild ? checkHasProducts(fullChild) : false;
                });
            }
            return false;
        };

        for (const category of categories) {
            const shouldBeActive = checkHasProducts(category);
            if (category.isActive !== shouldBeActive) {
                await this.categoryRepository.update(category.id, { isActive: shouldBeActive });
            }
        }
    }

    async getDescendantIds(parentId: number): Promise<number[]> {
        const children = await this.categoryRepository.find({ where: { parentId } });
        let ids = [parentId];
        for (const child of children) {
            const childIds = await this.getDescendantIds(child.id);
            ids = [...ids, ...childIds];
        }
        return Array.from(new Set(ids));
    }
}
