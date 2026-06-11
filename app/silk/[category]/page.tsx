import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, generateCollectionSchema, silkCategories } from '@/lib/seo-config';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

interface CategoryPageProps {
    params: {
        category: string;
    };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const category = getCategoryBySlug(params.category);

    if (!category) {
        return {
            title: 'Category Not Found',
        };
    }

    return {
        title: category.metaTitle,
        description: category.metaDescription,
        keywords: category.keywords,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title: category.metaTitle,
            description: category.metaDescription,
            url: `https://pratyagrasilks.com/silk/${category.slug}`,
            siteName: 'PratyagraSilks',
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: category.metaTitle,
            description: category.metaDescription,
        },
        alternates: {
            canonical: `https://pratyagrasilks.com/silk/${category.slug}`,
        },
    };
}

// Generate static params for all categories
export async function generateStaticParams() {
    return silkCategories.map((category) => ({
        category: category.slug,
    }));
}

import { createClient } from '@supabase/supabase-js';

// Fetch products for this category directly from DB for SSG
async function getCategoryProducts(categorySlug: string): Promise<Product[]> {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch available products
        const { data: available, error: availError } = await supabase
            .from('products')
            .select('*')
            .eq('is_online', true)
            .eq('in_stock', true)
            .eq('category', categorySlug)
            .order('created_at', { ascending: false })
            .limit(50);

        // Fetch up to 9 most recently sold products for the category
        const { data: sold, error: soldError } = await supabase
            .from('products')
            .select('*')
            .eq('is_online', true)
            .eq('in_stock', false)
            .eq('category', categorySlug)
            .order('updated_at', { ascending: false })
            .limit(9);

        if (availError || soldError) {
            console.error('Error fetching category products directly:', availError || soldError);
            return [];
        }

        const products = [...(available ?? []), ...(sold ?? [])];

        // Transform snake_case to camelCase
        return products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            images: product.images || [],
            inStock: product.in_stock,
            isOnline: product.is_online ?? true,
            sku: product.sku,
            material: product.material,
            dimensions: product.dimensions,
            weight: product.weight,
            yt_link: product.yt_link,
            colorFamilies: product.color_families ?? [],
            createdAt: product.created_at,
            updatedAt: product.updated_at,
        })) as Product[];
    } catch (error) {
        console.error('Error fetching category products:', error);
        return [];
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const category = getCategoryBySlug(params.category);

    if (!category) {
        notFound();
    }

    const products = await getCategoryProducts(params.category);
    const schema = generateCollectionSchema(category);

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />

            <div className="min-h-screen">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-16 md:py-24">
                    <div className="absolute inset-0 bg-[url('https://images.pixieset.com/859010601/05e114529e649bfbaac0385e3b61afb5-large.jpg')] bg-no-repeat bg-cover opacity-20"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        {/* Breadcrumb */}
                        <nav className="mb-6 text-sm">
                            <ol className="flex items-center space-x-2 text-white/80">
                                <li>
                                    <Link href="/" className="hover:text-white transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>/</li>
                                <li>
                                    <Link href="/collection" className="hover:text-white transition-colors">
                                        Collection
                                    </Link>
                                </li>
                                <li>/</li>
                                <li className="text-white font-medium">{category.name}</li>
                            </ol>
                        </nav>

                        <h1 className="text-4xl font-bold font-playfair mb-4">
                            {category.name}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 max-w-3xl">
                            {category.description}
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-12">

                    {/* Products Section */}
                    <section className='mb-12'>
                        <div className="flex flex-wrap items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold font-playfair text-gray-900">
                                Available {category.name} Sarees
                            </h2>
                            <Link
                                href={`/collection?category=${params.category}`}
                                className="text-accent hover:text-accent-hover font-medium flex items-center ml-auto"
                            >
                                View All
                                <svg
                                    className="w-5 h-5 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.slice(0, 8).map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <p className="text-textSecondary text-lg mb-4">
                                    No {category.name} sarees are currently available.
                                </p>
                                <p className="text-gray-500">
                                    Check back soon or explore our other collections.
                                </p>
                                <Link
                                    href="/collection"
                                    className="inline-block mt-6 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                                >
                                    Browse All Collections
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* About This Silk */}
                    <section className="bg-white rounded-lg shadow-md p-8 mb-12">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-6">
                            About {category.name}
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            {category.longDescription}
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            {/* Origin */}
                            <div className="bg-accent-light rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-primary mb-3">Origin</h3>
                                <p className="text-gray-700">{category.origin}</p>
                            </div>

                            {/* Price Range */}
                            <div className="bg-accent-light rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-primary mb-3">Price Range</h3>
                                <p className="text-gray-700 text-2xl font-bold">{category.priceRange}</p>
                            </div>
                        </div>

                        {/* Characteristics */}
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-primary mb-4">Key Characteristics</h3>
                            <ul className="grid md:grid-cols-2 gap-3">
                                {category.characteristics.map((char, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg
                                            className="w-6 h-6 text-accent mr-3 flex-shrink-0 mt-0.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span className="text-gray-700">{char}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="mt-16 bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-3xl font-bold font-playfair text-primary mb-8">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    What makes {category.name} special?
                                </h3>
                                <p className="text-gray-700">
                                    {category.name} sarees are renowned for their {category.characteristics[0].toLowerCase()} and {category.characteristics[1].toLowerCase()}.
                                    Handwoven by master artisans in {category.origin}, each saree represents centuries of weaving tradition and exceptional craftsmanship.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    How do I care for my {category.name} saree?
                                </h3>
                                <p className="text-gray-700">
                                    We recommend dry cleaning for {category.name} sarees to preserve their quality and luster.
                                    Store in a cool, dry place wrapped in muslin cloth. Avoid direct sunlight and moisture.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    What occasions are {category.name} sarees suitable for?
                                </h3>
                                <p className="text-gray-700">
                                    {category.name} sarees are perfect for weddings, festivals, formal events, and special celebrations.
                                    Their timeless elegance and rich craftsmanship make them ideal for any occasion where you want to make a lasting impression.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Do you offer customization?
                                </h3>
                                <p className="text-gray-700">
                                    While our {category.name} sarees are handpicked from master weavers, we can help you find specific colors or designs.
                                    Contact us for special requests and we'll do our best to accommodate your preferences.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="mt-16 bg-gradient-to-r from-primary to-primary-dark rounded-lg p-12 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
                            Explore More Silk Collections
                        </h2>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Discover our curated collection of authentic handwoven silk sarees from across India
                        </p>
                        <Link
                            href="/collection"
                            className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Browse All Collections
                        </Link>
                    </section>
                </div>
            </div>
        </>
    );
}
