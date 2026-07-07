import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipping & Delivery | Pratyagra Silks - Global Delivery",
    description: "Pratyagra Silks' Shipping Policy. We deliver globally with secure packaging. India: 2-7 days. International: 10-14 days. DDU terms apply internationally.",
    keywords: ["shipping", "delivery", "international delivery", "shipping policy", "customs duties"],
};

export default function ShippingPage() {
    const domesticOptions = [
        {
            detail: "Processing Time",
            timeline: "3-4 Working Days",
            description: "Quality checked and shipped from our facility",
        },
        {
            detail: "Delivery Time",
            timeline: "2-7 Working Days",
            description: "After dispatch (varies by location and season)",
        },
        {
            detail: "Carriers",
            timeline: "Multiple Options",
            description: "Delhivery, DTDC, India Post, or as requested",
        },
    ];

    const internationalOptions = [
        {
            detail: "Delivery Time",
            timeline: "10-14 Working Days",
            description: "After dispatch (depends on destination and customs)",
        },
        {
            detail: "Carriers",
            timeline: "Multiple Options",
            description: "DHL, India Post, or alternative services",
        },
        {
            detail: "Shipping Terms",
            timeline: "DDU (Duty Unpaid)",
            description: "Customer pays customs, duties, and import taxes",
        },
    ];

    const features = [
        {
            icon: "🌍",
            title: "Global Delivery",
            description: "We deliver worldwide to ensure your authentic silk sarees reach you securely, wherever you are.",
        },
        {
            icon: "📦",
            title: "Secure Packaging",
            description: "Each saree is carefully packaged with protective materials to ensure it arrives in perfect condition.",
        },
        {
            icon: "📍",
            title: "Tracking Available",
            description: "Track your order via email/SMS once dispatched. Monitor your shipment every step of the way.",
        },
        {
            icon: "⚠️",
            title: "Accuracy Matters",
            description: "Ensure your address, ZIP code, and contact number are correct at checkout to avoid delays.",
        },
    ];

    const faqs = [
        {
            question: "When does shipping start?",
            answer: "Orders are processed within 24-48 hours. Shipping starts once your payment is confirmed and the saree is packed.",
        },
        {
            question: "Can I change my delivery address?",
            answer: "Yes, you can change your address within 24 hours of placing your order. Contact us at info@pratyagrasilks.com immediately.",
        },
        {
            question: "What if my order is delayed?",
            answer: "We rarely experience delays. If your order is delayed beyond the promised timeframe, contact us and we'll investigate and provide compensation if applicable.",
        },
        {
            question: "How do I track my order?",
            answer: "You'll receive a tracking number via email as soon as your order ships. You can track it on the courier's website.",
        },
        {
            question: "What areas do you deliver to?",
            answer: "We deliver to all pin codes across India and over 200 countries worldwide. Some remote areas may have extended delivery times.",
        },
        {
            question: "Is cash on delivery available?",
            answer: "Yes, COD is available for domestic orders within India (excluding some remote areas). Additional charges may apply.",
        },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary-light text-white py-16 md:py-24 px-4">
                <div className="absolute inset-0 bg-[url('https://images.pixieset.com/859010601/c17bd08fc7e4bfe120c65606298bc77d-large.jpg')] bg-no-repeat bg-cover opacity-15"></div>
                <div className="max-w-4xl mx-auto text-center z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
                        Shipping & Delivery
                    </h1>
                    <p className="text-lg md:text-xl opacity-95">
                        We deliver globally, ensuring your authentic silks reach you securely
                    </p>
                </div>
            </section>

            {/* Shipping Features */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Our Shipping Guidelines
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                                <div className="text-4xl mb-3">{feature.icon}</div>
                                <h3 className="font-semibold text-lg text-primary mb-2">
                                    {feature.title}
                                </h3>
                                <p className=" text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Domestic Shipping */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Shipping Within India
                    </h2>

                    <div className="space-y-6 mb-8">
                        {domesticOptions.map((option, index) => (
                            <div key={index} className="bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary rounded-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-lg text-primary mb-2">
                                            {option.detail}
                                        </h3>
                                        <p className=" mb-2">{option.timeline}</p>
                                        <p className="text-textSecondary text-sm">{option.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-primary mb-3">📝 Important Notes:</h3>
                        <ul className="space-y-2  text-sm">
                            <li>• Timelines are working days, excluding weekends and public holidays</li>
                            <li>• Delivery times vary based on location and festival seasons</li>
                            <li>• Tracking details will be shared via email/SMS after dispatch</li>
                            <li>• Ensure your address, ZIP code, and phone number are accurate</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* International Shipping */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        International Shipping (Overseas)
                    </h2>

                    <div className="space-y-6 mb-8">
                        {internationalOptions.map((option, index) => (
                            <div key={index} className="bg-white border-l-4 border-primary rounded-lg p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-lg text-primary mb-2">
                                            {option.detail}
                                        </h3>
                                        <p className=" font-semibold mb-2">{option.timeline}</p>
                                        <p className="text-textSecondary text-sm">{option.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Customs & Duties Section */}
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                        <h3 className="font-bold text-lg text-red-700 mb-4">⚠️ CRUCIAL: Customs, Duties & Import Charges</h3>
                        <div className="space-y-4 text-gray-800">
                            <div>
                                <p className="font-semibold text-primary mb-2">DDU Terms (Delivery Duty Unpaid):</p>
                                <p className="text-sm">All international orders are shipped under DDU terms. This means you (the customer) are responsible for paying any customs duties, import taxes, or charges levied by the destination country.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-primary mb-2">Your Responsibility:</p>
                                <p className="text-sm">Customs duties, import taxes, and all charges levied by the destination country's customs authorities are entirely your responsibility and must be paid by you.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-primary mb-2">Refusal of Delivery:</p>
                                <p className="text-sm">If you refuse to pay these charges and the shipment is returned to Pratyagra Silks, any eligible refund will be processed ONLY after deducting:</p>
                                <ul className="list-disc list-inside text-sm mt-2 ml-2">
                                    <li>Return handling charges</li>
                                    <li>Any duties, taxes, or penalties imposed by customs authorities</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-primary mb-3">📝 International Shipping Notes:</h3>
                        <ul className="space-y-2  text-sm">
                            <li>• Timelines depend on destination country and customs processing time</li>
                            <li>• Tracking details will be provided via email/SMS</li>
                            <li>• We handle all export documentation</li>
                            <li>• Customs duties and import taxes are NOT included in the order price</li>
                            <li>• Customer is responsible for all duties and taxes upon delivery</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Order Processing */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        From Order to Delivery
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold">
                                    1
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Order Placed</h3>
                                <p className="">You complete your purchase and receive an order confirmation email.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold">
                                    2
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Quality Check & Processing (3-4 Days)</h3>
                                <p className="">Your saree is thoroughly quality checked and prepared for shipment from our facility.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold">
                                    3
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Careful Packing</h3>
                                <p className="">Your saree is securely packed with protective materials to ensure safe arrival.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold">
                                    4
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Shipment Dispatch</h3>
                                <p className="">Your package is handed over to the courier. You receive tracking details via email/SMS.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold">
                                    5
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">In Transit</h3>
                                <p className="">Track your shipment in real-time. Delivery time: 2-7 days (India) or 10-14 days (International).</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold">
                                    6
                                </div>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">Delivery & Enjoyment</h3>
                                <p className="">Your saree arrives at your doorstep! Unwrap and enjoy your beautiful handmade saree.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Shipping Questions
                    </h2>

                    <div className="space-y-6">
                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Why is accurate address information important?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Please ensure your shipping address, ZIP/postal code, and contact number are complete and accurate at checkout. Errors in these details may result in shipment delays or delivery failures, for which we cannot be held liable.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                When will I receive my tracking information?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Tracking details will be shared via email/SMS once your order has been dispatched from our facility. You can then monitor your shipment in real-time.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                What if my shipment is delayed by the courier?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                While we partner with reliable logistics providers, we are not responsible for unforeseen delays caused by the courier or logistics partners. However, we'll help you track and investigate any significant delays.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                How are shipping charges calculated?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Shipping charges are calculated at checkout and may vary based on the delivery location (domestic vs. international) and order weight. You'll see the final shipping cost before confirming your order.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Who pays for customs duties on international orders?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                All international orders are shipped under DDU (Delivery Duty Unpaid) terms. This means YOU are responsible for paying any customs duties, import taxes, or charges levied by the destination country. These are NOT included in your order price.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                What happens if I refuse to pay customs charges?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                If you refuse to pay customs duties and the shipment is returned to Pratyagra Silks, any eligible refund will be processed ONLY after deducting return handling charges and any duties, taxes, or penalties imposed by customs authorities.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Can I change my delivery address after ordering?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Please contact us immediately if you need to change your address. We can help if the saree hasn't been dispatched yet. Once shipped, the courier may not be able to redirect the package.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* Damaged/Lost Package */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        What if Something Goes Wrong?
                    </h2>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-8 rounded-lg">
                        <p className="text-gray-800 leading-relaxed mb-4">
                            We take every precaution to ensure your saree arrives safely and in perfect condition. However, if your package is damaged or lost, we're here to help.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-primary mb-2">1. Report Immediately</p>
                                <p className=" text-sm">Contact us within 24 hours if your saree is damaged or the package is lost. Provide photos of the damage.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-primary mb-2">2. Our Team Takes Over</p>
                                <p className=" text-sm">We'll file a claim with the courier and handle the investigation with our logistics partners.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-primary mb-2">3. Resolution</p>
                                <p className=" text-sm">Once the claim is settled, we'll replace your saree or issue a full refund. We want to make sure you get what you ordered!</p>
                            </div>
                        </div>
                        <p className="text-gray-800 mt-4 font-semibold italic">
                            Contact us at info@pratyagrasilks.com for any shipping concerns.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-primary to-primary-light text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
                        Ready to Order?
                    </h2>
                    <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
                        Browse our beautiful collection of handmade silk sarees. We'll package them carefully and deliver them securely to you, anywhere in the world.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Shop Now
                    </Link>
                </div>
            </section>
        </div>
    );
}

