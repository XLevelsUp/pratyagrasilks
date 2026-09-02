// Core TypeScript interfaces for Pratyagra Silks e-commerce

// Vendor type ('Artisan' | 'City' | 'Wholesaler') is stored in metadata.type
export interface Vendor {
    id: string;
    name: string;
    address?: string | null;
    contactPerson?: string | null;
    phone?: string | null;
    /** Paths/signed URLs pointing to files in the 'vendor-docs' storage bucket (max 5) */
    documentUrls: string[];
    /** Flexible bag: { type: 'Artisan'|'City'|'Wholesaler', gst?: string, notes?: string, ... } */
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // MRP — never reduced by an offer
    discountType?: 'AMT' | 'PCT' | null;
    discountValue?: number | null;
    salePrice?: number | null; // what the customer pays; null = no offer
    excludeFromSales?: boolean; // held at full price during bulk sales
    category: string;
    images: string[];
    inStock: boolean;
    isOnline: boolean; // true = listed on website; false = physical POS only
    sku: string;
    material: string;
    dimensions?: string;
    weight?: number;
    yt_link?: string | null;
    colorFamilies?: string[];
    vendorId?: string | null;
    vendor?: Vendor; // populated when joined
    createdAt: Date;
    updatedAt: Date;
}

export interface CartItem {
    productId: string;
    product: Product;
    addedAt: Date;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: {
        fullName: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    paymentMethod: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentId?: string; // Stripe session ID
    orderNumber?: string; // Unique order identifier
    shippingCost?: number;
    createdAt: Date;
    updatedAt: Date;
    deliveredAt?: Date;
}

export interface WishlistItem {
    id: string;
    customerId: string;
    productId: string;
    product: Product;
    createdAt: Date;
}

// ── Blog ─────────────────────────────────────────────────────────────────

export interface BlogCategory {
    slug: string;
    name: string;
    sortOrder: number;
}

export type ImageDisplayMode = 'cover' | 'contain';

export interface BlogSubsection {
    id: string;
    sectionId: string;
    sortOrder: number;
    heading: string | null;
    bodyHtml: string;
}

export interface BlogSection {
    id: string;
    postId: string;
    sortOrder: number;
    blockType: 'section' | 'callout';
    heading: string | null;
    bodyHtml: string;
    secondImageUrl?: string | null;
    secondImageAlt?: string | null;
    secondImageMode: ImageDisplayMode;
    subsections: BlogSubsection[];
}

export interface BlogQnA {
    id: string;
    postId: string;
    sortOrder: number;
    question: string;
    answer: string;
}

export interface BlogCtaButton {
    id: string;
    postId: string;
    sortOrder: number;
    label: string;
    url: string;
}

export interface BlogComment {
    id: string;
    postId: string;
    name: string;
    email: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    featuredImageUrl?: string | null;
    featuredImageAlt?: string | null;
    featuredImageMode: ImageDisplayMode;
    introHtml: string;
    categorySlug: string | null;
    category?: BlogCategory;
    author: string;
    tags: string[];
    readingTimeMinutes: number;
    publishedAt: Date;
    metaDescription: string | null;
    ctaIntroText: string | null;
    sections: BlogSection[];
    qna: BlogQnA[];
    ctaButtons: BlogCtaButton[];
    createdAt: Date;
    updatedAt: Date;
}

/** Shape submitted from the admin post form — nested arrays are replaced wholesale on save. */
export interface BlogPostInput {
    slug: string;
    title: string;
    featuredImageUrl?: string | null;
    featuredImageAlt?: string | null;
    featuredImageMode: ImageDisplayMode;
    introHtml: string;
    categorySlug: string | null;
    author: string;
    tags: string[];
    readingTimeMinutes: number;
    publishedAt: string; // ISO date from the form's date input
    metaDescription: string | null;
    ctaIntroText: string | null;
    sections: Array<{
        blockType: 'section' | 'callout';
        heading: string | null;
        bodyHtml: string;
        secondImageUrl?: string | null;
        secondImageAlt?: string | null;
        secondImageMode: ImageDisplayMode;
        subsections: Array<{ heading: string | null; bodyHtml: string }>;
    }>;
    qna: Array<{ question: string; answer: string }>;
    ctaButtons: Array<{ label: string; url: string }>;
}
