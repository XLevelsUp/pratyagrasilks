import Link from 'next/link';

// Placeholder shown where product listings normally sit, but ONLY while
// app/maintenance.css is imported in the root layout — that stylesheet flips
// `data-maint="notice"` back to display:block. Without it the `hidden` class
// below keeps this out of sight, so the component is inert in normal
// operation and needs no cleanup when the break ends.
export default function MaintenanceNotice() {
    return (
        <div
            data-maint="notice"
            className="hidden py-16 md:py-20 text-center"
        >
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-textSecondary/50 mb-4">
                Maintenance break
            </p>
            <h3 className="font-playfair text-2xl md:text-3xl font-semibold text-primary mb-3">
                Our looms are resting — briefly
            </h3>
            <p className="text-textSecondary mb-8 max-w-md mx-auto">
                We&rsquo;re restocking and refreshing the collection. Every piece will
                be back on display shortly — thank you for your patience.
            </p>
            <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-primary text-secondary font-semibold rounded-full hover:bg-primary-light transition-colors"
            >
                Contact Us
            </Link>
        </div>
    );
}
