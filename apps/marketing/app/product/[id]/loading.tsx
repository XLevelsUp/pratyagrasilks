// Route-level skeleton — the product fetch blocks render server-side, so
// this gives an instant editorial frame matching ProductDetailClient's layout.
export default function ProductLoading() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb line */}
                <div className="h-3 w-64 rounded bg-gray-200 animate-pulse mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Gallery skeleton */}
                    <div>
                        <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="w-20 h-20 rounded-lg bg-gray-200 animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Info skeleton */}
                    <div className="space-y-5 animate-pulse">
                        <div className="h-3 w-32 rounded bg-gray-200" />
                        <div className="h-10 w-3/4 rounded-lg bg-primary/10" />
                        <div className="h-3 w-24 rounded bg-gray-200" />
                        <div className="h-8 w-40 rounded bg-gray-200" />
                        <div className="space-y-2 pt-4">
                            <div className="h-4 w-full rounded bg-gray-200" />
                            <div className="h-4 w-5/6 rounded bg-gray-200" />
                            <div className="h-4 w-2/3 rounded bg-gray-200" />
                        </div>
                        <div className="space-y-3 pt-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-4 w-full rounded bg-gray-200" />
                            ))}
                        </div>
                        <div className="h-14 w-full rounded-full bg-primary/20 mt-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}
