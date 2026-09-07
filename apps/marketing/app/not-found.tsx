import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-primary-light flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* 404 Number with elegant styling */}
                <div className="mb-8">
                    <h1 className="font-playfair text-[150px] md:text-[200px] font-bold text-secondary/20 leading-none">
                        404
                    </h1>
                    <div className="relative -mt-16 md:-mt-24">
                        <h2 className="font-playfair text-3xl md:text-5xl font-bold text-white mb-4">
                            Page Not Found
                        </h2>
                        <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
                    </div>
                </div>

                {/* Message */}
                <p className="text-white/90 text-lg md:text-xl mb-8 max-w-lg mx-auto leading-relaxed">
                    It seems the silk thread you're following has led to an uncharted path.
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Suggestions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
                    <h3 className="font-playfair text-xl md:text-2xl font-semibold text-secondary mb-4">
                        Let us guide you back
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80 text-left">
                        <div className="flex items-start gap-3">
                            <span className="text-secondary text-xl">•</span>
                            <span>Explore our exquisite silk saree collection</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-secondary text-xl">•</span>
                            <span>Browse by silk type or region</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-secondary text-xl">•</span>
                            <span>Return to our homepage</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-secondary text-xl">•</span>
                            <span>Check your order status</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto"
                    >
                        Return Home
                    </Link>
                    <Link
                        href="/collection"
                        className="inline-block bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/30 transition-all duration-300 border border-white/30 w-full sm:w-auto"
                    >
                        Browse Collection
                    </Link>
                </div>

                {/* Decorative element */}
                <div className="mt-12 flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary/40 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-secondary/60 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-secondary/80 animate-pulse delay-150"></div>
                </div>
            </div>
        </div>
    );
}

