// Core TypeScript interfaces for KandangiSarees e-commerce

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
    price: number;
    category: string;
    images: string[];
    /** Map of image public URL -> base64 blurDataURL (LQIP). Empty/missing for legacy images. */
    blurMap?: Record<string, string>;
    /** Map of image public URL -> { width(px): variant public URL }. Missing/partial for legacy images. */
    imageVariants?: Record<string, Record<number, string>>;
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
