import { Suspense } from 'react';
import CollectionClient from '@/components/CollectionClient';

export default function CollectionPage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-primary-light text-white py-12">
                <div className="absolute inset-0 bg-[url('https://images.pixieset.com/859010601/05e114529e649bfbaac0385e3b61afb5-large.jpg')] bg-no-repeat bg-cover opacity-30"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl font-bold mb-2 font-playfair">Our Silk Saree Collection</h1>
                    <p className="text-white/80 mt-2 max-w-3xl">
                        Explore handwoven Kanjivaram, Muga, Tussar and Georgette silk sarees crafted by master weavers. Authentic heirloom quality, direct from weavers across India.
                    </p>
                </div>
            </div>

            {/* Client-side Filters & Product Grid */}
            <Suspense fallback={
                <div className="container mx-auto px-4 py-16 text-center animate-pulse">
                    <div className="text-textSecondary text-lg">Loading collection products...</div>
                </div>
            }>
                <CollectionClient />
            </Suspense>
        </div>
    );
}
