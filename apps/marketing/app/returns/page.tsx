import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Returns & Exchanges | Pratyagra Silks - Quality Guarantee",
    description: "Pratyagra Silks' Returns & Exchange Policy. We accept returns for defects only within 24 hours of delivery. Learn about our quality commitment and return process.",
    keywords: ["returns policy", "exchanges", "defects", "refunds", "handloom quality"],
};

export default function ReturnsPage() {
    const defectSteps = [
        {
            number: 1,
            title: "Report Within 24 Hours",
            description: "If the saree is damaged or defective, email info@pratyagrasilks.com within 24 hours of delivery with your order ID, description, and photos.",
        },
        {
            number: 2,
            title: "Submit Photos",
            description: "Include clear photographs of the defect so our team can properly review and assess the issue.",
        },
        {
            number: 3,
            title: "Approval",
            description: "Our team will review your request and let you know if it qualifies as a legitimate defect.",
        },
        {
            number: 4,
            title: "Return Shipping",
            description: "Once approved, we'll guide you through the return shipping process.",
        },
        {
            number: 5,
            title: "Refund",
            description: "After we receive and inspect the saree, your refund will be processed in 5-7 business days.",
        },
    ];

    const defects = [
        { text: "Tear in the saree body exceeding 20mm (no visible interwoven silk thread)" },
        { text: "Incorrect length (significantly different from stated length)" },
        { text: "Missing blouse piece (if mentioned in product description)" },
    ];

    const notDefects = [
        { text: "Small knots or bumps from pieced-together threads" },
        { text: "Uneven threads connecting the border to the body" },
        { text: "Slubs (tiny linear knots of residual threads)" },
        { text: "Minute thread gaps or missing lines in the saree body, pallu, or motifs" },
        { text: "Dye bleeding (where dyed threads naturally run over zari threads)" },
    ];

    const notEligible = [
        { text: "Mind change or disliking the product after purchase" },
        { text: "Color deviations (due to monitor/device settings or neutral lighting in photos)" },
        { text: "Changing your mind about the saree" },
        { text: "Sarees returned after 24 hours (unless approved as defective)" },
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary-light text-white py-16 md:py-24 px-4">
            <div className="absolute inset-0 bg-[url('https://images.pixieset.com/859010601/d535e954ec6c8338563e7b0fca472dad-large.jpg')] bg-no-repeat bg-cover opacity-15"></div>
                <div className="max-w-4xl mx-auto text-center z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
                        Returns & Exchanges
                    </h1>
                    <p className="text-lg md:text-xl opacity-95">
                        We stand behind our handmade sarees. Quality issues? We're here to help.
                    </p>
                </div>
            </section>

            {/* Return Policy Overview */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Our Quality Commitment
                    </h2>

                    <div className="bg-primary/5 border-l-4 border-primary p-8 mb-12 rounded-lg">
                        <p className="text-gray-800 text-lg leading-relaxed mb-4">
                            All our handmade silk sarees are carefully checked for quality and defects before shipping. We believe in delivering only the best. However, handloom products naturally have unique weaving characteristics that are not defects—they're part of the art.
                        </p>
                        <p className="text-gray-800 text-lg leading-relaxed">
                            If you receive a genuinely damaged or defective saree, we're here to help. Report it within 24 hours, and we'll take care of the rest.
                        </p>
                    </div>

                    {/* Legitimate Defects */}
                    <div className="mb-12">
                        <h3 className="font-playfair text-2xl font-bold text-primary mb-6 text-center">
                            What Counts as a Defect?
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <ul className="space-y-3">
                                {defects.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="text-red-600 font-bold mt-1">✗</span>
                                        <span className="">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Natural Handloom Characteristics */}
                    <div>
                        <h3 className="font-playfair text-2xl font-bold text-primary mb-6 text-center">
                            Handloom Characteristics (Not Defects)
                        </h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <p className=" text-sm mb-4 italic">
                                These natural features of handwoven sarees are not considered defects:
                            </p>
                            <ul className="space-y-3">
                                {notDefects.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="text-green-600 font-bold mt-1">✓</span>
                                        <span className="">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Return Process */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        How to Report a Defect
                    </h2>

                    <div className="space-y-6">
                        {defectSteps.map((step) => (
                            <div key={step.number} className="flex gap-6 bg-white rounded-lg shadow-md p-6">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold text-lg">
                                        {step.number}
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Refund Information */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Return & Refund Process
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="font-semibold text-lg text-primary mb-4">
                                Report Window
                            </h3>
                            <ul className="space-y-2 ">
                                <li><strong>24 hours:</strong> Report defects after delivery</li>
                                <li><strong>Email:</strong> info@pratyagrasilks.com</li>
                                <li><strong>Include:</strong> Order ID, photos of defect</li>
                            </ul>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="font-semibold text-lg text-primary mb-4">
                                Refund Timeline
                            </h3>
                            <ul className="space-y-2 ">
                                <li><strong>After Approval:</strong> We'll guide return process</li>
                                <li><strong>5-7 days:</strong> Processing time after we receive it</li>
                                <li><strong>Full Refund:</strong> To original payment method</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-lg text-primary mb-4">
                            📝 Important Return Conditions
                        </h3>
                        <ul className="space-y-3  ml-4">
                            <li>• Saree must be returned in original condition and packaging</li>
                            <li>• Report defects within 24 hours of delivery</li>
                            <li>• Photos must clearly show the defect</li>
                            <li>• Decision to accept returns rests with Pratyagra Silks Team</li>
                            <li>• This policy is non-negotiable for all returns</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Exchange Option */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-6">
                        Exchange Option
                    </h2>
                    <p className=" text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        If your saree has a defect, you can choose to exchange it for another saree instead of getting a refund. We offer one exchange per order.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-2xl font-bold text-primary mb-2">Once Per Order</p>
                            <p className="">You can exchange a defective saree one time</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-2xl font-bold text-primary mb-2">Approval Required</p>
                            <p className="">Exchange must be approved by our team</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-2xl font-bold text-primary mb-2">Same Process</p>
                            <p className="">Report within 24 hours with photos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Questions About Our Policy
                    </h2>

                    <div className="space-y-6">
                        <details className="bg-gray-50 rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                What exactly counts as a defect?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                A tear larger than 20mm with no visible interwoven silk thread, incorrect length that significantly deviates from what was stated, or a missing blouse piece (if mentioned in the description). Small knots, uneven threads, dye bleeding, and slubs are natural handloom characteristics—not defects.
                            </p>
                        </details>

                        <details className="bg-gray-50 rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Why do I have to report within 24 hours?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                This helps us verify that the defect occurred during manufacturing or shipping, not from use. Reporting quickly with photos allows us to assess the issue properly and help you faster.
                            </p>
                        </details>

                        <details className="bg-gray-50 rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                What if I just don't like the saree?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Unfortunately, we don't accept returns for mind change or disliking the product. Our policy covers defects only. This is because handloom sarees are handmade products with unique characteristics. Before ordering, we recommend checking the photos, measurements, and color details carefully.
                            </p>
                        </details>

                        <details className="bg-gray-50 rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Are color deviations covered?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                No. Our photos are taken under neutral lighting, but colors can appear different on your monitor or device. This is not a defect and doesn't qualify for return. We recommend checking your device settings and taking the product photo in good lighting to compare.
                            </p>
                        </details>

                        <details className="bg-gray-50 rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Can I exchange more than once?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                No. You can exchange a defective saree only once per order. After that, we process a refund if there are additional issues. This ensures fairness for all customers.
                            </p>
                        </details>

                        <details className="bg-gray-50 rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                What happens if you reject my return request?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Our team reviews each case carefully. If we determine it's not a defect (like handloom characteristics or color differences), we won't process the return. We'll explain our decision and answer any questions you have.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-primary to-primary-light text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6">
                        Need More Help?
                    </h2>
                    <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
                        If you have any questions about returns or exchanges, our customer support team is ready to help.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-secondary text-primary font-semibold px-8 py-4 rounded-full text-lg hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Contact Us
                    </Link>
                </div>
            </section>
        </div>
    );
}

