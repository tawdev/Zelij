const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    parentId: number | null;
    parent?: Category | null;
    children?: Category[];
    createdAt: string;
    products?: any[]; // For count calculation
}

export interface Product {
    id: number;
    name: string;
    slug: string | null;
    sku: string | null;
    price: number;
    oldPrice?: number | null;
    stock: number;
    imageUrl: string | null;
    imageUrls: string[];
    category: Category | null;
    categoryId: number | null;
    brand: Brand | null;
    brandId: number | null;
    onSale: boolean;
    ecoFriendly: boolean;
    tags: string[];
    description: string | null;
    isFeatured: boolean;
    finishing?: string | null;
    shape?: string | null;
    thickness?: number | null;
    pricingUnit?: string;
    formatWidth?: number | null;
    formatHeight?: number | null;
    boxCoverageM2?: number | null;
    boxWeight?: number | null;
    stockM2?: number | null;
    pricePerM2?: number | null;
    minOrderM2?: number;
    createdAt: string;
    ratingAvg?: number;
    reviewCount?: number;
}

export interface CalculateAreaInput {
    width: number;
    height: number;
    numberOfAreas?: number;
    wastageApplied?: boolean;
}

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

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    ecoFriendly?: boolean;
    isFeatured?: boolean;
    sort?: string;
}

export interface Order {
    id: number;
    customerName: string;
    email: string;
    phone: string | null;
    address: string | null;
    invoiceReference: string | null;
    items: any;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
    createdAt: string;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string | null;
    excerpt: string | null;
    imageUrl: string | null;
    status: string; // Draft, Published
    author: string;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    publishDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: number;
    email: string;
    fullName: string;
    role: 'super_admin' | 'admin' | 'manager' | 'customer';
    isActive: boolean;
    createdAt: string;
}

export interface NewsletterSubscriber {
    id: number;
    email: string;
    subscribedAt: string;
}

export interface Tip {
    id: number;
    content: string;
    authorName: string;
    authorRole: string;
    isActive: boolean;
    createdAt: string;
}

export interface TagCount {
    tag: string;
    count: number;
}

export interface Brand {
    id: number;
    name: string;
    logoUrl: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    initial: string;
    tag: string;
    date: string;
    active: boolean;
    createdAt: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'pending' | 'read' | 'replied' | 'archived';
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface StoreSettings {
    id: number;
    storeName: string;
    supportEmail: string;
    phoneNumber: string;
    address: string;
    logoUrl: string | null;
    logoDarkUrl: string | null;
    workingHours: string | null;
    description: string | null;
    updatedAt: string;
}

export interface ProductStats {
    total: number;
    lowStock: number;
    outOfStock: number;
    active: number;
    maxPrice?: number;
}

export interface OrderStats {
    total: number;
    pending: number;
    revenue: number;
    inTransit: number;
    todayCount: number;
}

export interface AnalyticsData {
    kpis: {
        totalRevenue: number;
        revenueTrend: number;
        avgOrderValue: number;
        orderTrend: number;
        conversionRate: number;
        conversionTrend: number;
        pendingOrders: number;
        pendingTrend: number;
        newCustomers: number;
        customerTrend: number;
        totalOrders: number;
        totalOrdersTrend: number;
        totalProducts: number;
    };
    trendData: {
        date: string;
        revenue: string;
        orders: string;
    }[];
    salesByCategory: {
        name: string;
        value: string;
    }[];
    topProducts: {
        id: number;
        name: string;
        category: string;
        sales: number;
        imageUrl: string | null;
    }[];
    inventoryHealth: {
        lowStock: number;
        outOfStock: number;
        healthy: number;
    };
    categoryDistribution: {
        name: string;
        count: string;
    }[];
}

export interface Review {
    id: number;
    productId: number;
    name: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    product?: Product;
}

import Cookies from 'js-cookie';

// ─── Image URL Helper ─────────────────────────────────────────────────────────

function normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    return `${(API_BASE || '').replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

function fixImageUrls<T>(data: T): T {
    if (data === null || data === undefined) return data;
    if (Array.isArray(data)) return data.map(fixImageUrls) as unknown as T;
    if (typeof data === 'object') {
        const obj = data as Record<string, any>;
        const result: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            if ((key === 'imageUrl' || key === 'logoUrl' || key === 'logoDarkUrl') && typeof obj[key] === 'string') {
                result[key] = normalizeImageUrl(obj[key]);
            } else if (key === 'imageUrls' && Array.isArray(obj[key])) {
                result[key] = obj[key].map((url: string) => typeof url === 'string' ? normalizeImageUrl(url) : url);
            } else if (typeof obj[key] === 'object') {
                result[key] = fixImageUrls(obj[key]);
            } else {
                result[key] = obj[key];
            }
        }
        return result as T;
    }
    return data;
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const isBrowser = typeof window !== 'undefined';
    const token = isBrowser ? Cookies.get('auth_token') : null;
    const baseUrl = (API_BASE || '').replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    const url = `${baseUrl}/${cleanPath}`;
    
    const res = await fetch(url, {
        cache: 'no-store',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    if (!res.ok) {
        if (res.status === 401 && isBrowser) {
            Cookies.remove('auth_token');
            // Small delay to allow the user to see the error if needed, or just redirect
            window.location.href = '/';
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `API error ${res.status}: ${path}`);
    }
    if (res.status === 204 || res.headers.get('Content-Length') === '0') {
        return {} as T;
    }
    const text = await res.text();
    if (!text) return {} as T;
    try {
        const json = JSON.parse(text);
        return fixImageUrls(json) as T;
    } catch (e) {
        return {} as any;
    }
}

export const api = {
    // Products
    getProducts: (query: ProductQuery & { active?: boolean } = {}) => {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value.toString());
            }
        });
        if (!query.page) params.append('page', '1');
        if (!query.limit) params.append('limit', '8');
        return apiFetch<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    },
    getProductStats: () => apiFetch<ProductStats>('/products/stats'),
    getTags: () => apiFetch<string[]>('/products/tags'),
    getProductById: (id: string | number) => apiFetch<Product>(`/products/${id}`),
    getProductBySlug: (slug: string) => apiFetch<Product>(`/products/slug/${slug}`),
    createProduct: (data: Partial<Product> & { categoryName?: string }) => apiFetch<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateProduct: (id: number, data: Partial<Product> & { categoryName?: string }) => apiFetch<Product>(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteProduct: (id: number) => apiFetch<void>(`/products/${id}`, {
        method: 'DELETE',
    }),
    calculateArea: (id: number, data: CalculateAreaInput) => apiFetch<AreaCalculationResult>(`/products/calculate/${id}`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = Cookies.get('auth_token');
        return fetch(`${API_BASE}/upload`, {
            method: 'POST',
            ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
            body: formData,
        }).then(async (res) => {
            if (!res.ok) throw new Error('Failed to upload image');
            const json = await res.json() as { url: string; filename: string };
            json.url = normalizeImageUrl(json.url) || json.url;
            return json;
        });
    },
    uploadImages: (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const token = Cookies.get('auth_token');
        return fetch(`${API_BASE}/upload/multiple`, {
            method: 'POST',
            ...(token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}),
            body: formData,
        }).then(async (res) => {
            if (!res.ok) throw new Error('Failed to upload images');
            const json = await res.json() as { url: string; filename: string }[];
            return json.map(item => ({
                ...item,
                url: normalizeImageUrl(item.url) || item.url
            }));
        });
    },

    // Orders
    getOrders: (page = 1, limit = 10, status?: string, search?: string) => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (status) params.append('status', status);
        if (search) params.append('search', search);
        return apiFetch<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
    },
    getOrderStats: () => apiFetch<OrderStats>('/orders/stats'),
    getOrderById: (id: string | number) => apiFetch<Order>(`/orders/${id}`),
    createOrder: (data: Partial<Order>) => apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateOrderStatus: (id: number, status: Order['status'], email?: string) => apiFetch<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, email }),
    }),
    resendInvoice: (id: number) => apiFetch<{ success: boolean; message: string }>(`/orders/${id}/resend-invoice`, {
        method: 'POST',
    }),
    trackOrder: (reference: string) => apiFetch<Order>(`/orders/track/${reference}`),
    deleteOrder: (id: number) => apiFetch<void>(`/orders/${id}`, {
        method: 'DELETE',
    }),
    bulkDeleteOrders: (ids: number[]) => apiFetch<void>('/orders/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    }),

    // Categories
    getCategories: (activeOnly = false) => apiFetch<Category[]>(`/categories${activeOnly ? '?active=true' : ''}`),
    getCategoriesWithProducts: () => apiFetch<Category[]>('/categories/with-products'),
    getUniqueCategories: () => apiFetch<string[]>('/blog/categories/unique'),
    createCategory: (data: { name: string; description?: string; isActive?: boolean; parentId?: number | null }) => apiFetch<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateCategory: (id: number, data: { name?: string; description?: string; isActive?: boolean; parentId?: number | null }) => apiFetch<Category>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id: number) => apiFetch<void>(`/categories/${id}`, {
        method: 'DELETE',
    }),

    // Blog
    getPosts: (page = 1, limit = 6, search?: string, tag?: string, category?: string, sort?: string) => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (search) params.append('search', search);
        if (tag) params.append('tag', tag);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);
        return apiFetch<PaginatedResponse<BlogPost>>(`/blog?${params.toString()}`);
    },
    getPostBySlug: (slug: string) => apiFetch<BlogPost>(`/blog/slug/${slug}`),
    createPost: (data: Partial<BlogPost>) => apiFetch<BlogPost>('/blog', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updatePost: (id: number, data: Partial<BlogPost>) => apiFetch<BlogPost>(`/blog/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deletePost: (id: number) => apiFetch<void>(`/blog/${id}`, {
        method: 'DELETE',
    }),

    // Analytics
    getAnalytics: (from?: string, to?: string) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiFetch<AnalyticsData>(`/analytics/dashboard${query}`);
    },

    // Brands
    getBrands: () => apiFetch<Brand[]>('/brands'),
    getActiveBrands: () => apiFetch<Brand[]>('/brands/active'),
    getBrandsWithProducts: () => apiFetch<Brand[]>('/brands/with-products'),
    createBrand: (data: { name: string; logoUrl?: string; isActive?: boolean }) => apiFetch<Brand>('/brands', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateBrand: (id: number, data: { name?: string; logoUrl?: string; isActive?: boolean }) => apiFetch<Brand>(`/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteBrand: (id: number) => apiFetch<void>(`/brands/${id}`, {
        method: 'DELETE',
    }),

    // Newsletter
    subscribeNewsletter: (email: string) => apiFetch<NewsletterSubscriber>('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }),
    getNewsletterSubscribers: () => apiFetch<NewsletterSubscriber[]>('/newsletter/subscribers'),
    getNewsletterStats: () => apiFetch<{ count: number }>('/newsletter/stats'),
    deleteSubscriber: (id: number) => apiFetch<void>(`/newsletter/subscribers/${id}`, {
        method: 'DELETE',
    }),

    // Tags
    getPopularTags: () => apiFetch<TagCount[]>('/blog/tags'),

    // Tips
    getActiveTip: () => apiFetch<Tip | null>('/tips/active'),
    getTips: () => apiFetch<Tip[]>('/tips'),
    createTip: (data: Partial<Tip>) => apiFetch<Tip>('/tips', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateTip: (id: number, data: Partial<Tip>) => apiFetch<Tip>(`/tips/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteTip: (id: number) => apiFetch<void>(`/tips/${id}`, {
        method: 'DELETE',
    }),

    // Settings
    getSettings: () => apiFetch<StoreSettings>('/settings'),
    updateSettings: (data: Partial<StoreSettings>) => apiFetch<StoreSettings>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    // Reviews
    submitReview: (data: { productId: number; name: string; rating: number; comment: string }) => apiFetch<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getProductReviews: (productId: number | string) => apiFetch<Review[]>(`/reviews/product/${productId}`),
    getAllReviews: (status?: string) => {
        const query = status ? `?status=${status}` : '';
        return apiFetch<Review[]>(`/reviews${query}`);
    },
    updateReviewStatus: (id: number, status: 'pending' | 'approved' | 'rejected') => apiFetch<Review>(`/reviews/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
    deleteReview: (id: number) => apiFetch<void>(`/reviews/${id}`, {
        method: 'DELETE',
    }),

    // Testimonials
    getTestimonials: () => apiFetch<Testimonial[]>('/testimonials'),
    getAdminTestimonials: () => apiFetch<Testimonial[]>('/testimonials/admin'),
    createTestimonial: (data: Partial<Testimonial>) => apiFetch<Testimonial>('/testimonials', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateTestimonial: (id: number, data: Partial<Testimonial>) => apiFetch<Testimonial>(`/testimonials/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteTestimonial: (id: number) => apiFetch<void>(`/testimonials/${id}`, {
        method: 'DELETE',
    }),

    // Contact
    getContactMessages: () => apiFetch<ContactMessage[]>('/contact'),
    updateContactStatus: (id: number, status: ContactMessage['status'], adminNote?: string) => apiFetch<ContactMessage>(`/contact/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote }),
    }),
    deleteContactMessage: (id: number) => apiFetch<void>(`/contact/${id}`, {
        method: 'DELETE',
    }),

    // Users (Admin Only)
    getUsers: () => apiFetch<User[]>('/users'),
    getUserById: (id: number | string) => apiFetch<User>(`/users/${id}`),
    createUser: (data: Partial<User> & { password?: string }) => apiFetch<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateUser: (id: number | string, data: Partial<User> & { password?: string }) => apiFetch<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteUser: (id: number | string) => apiFetch<void>(`/users/${id}`, {
        method: 'DELETE',
    }),
};
