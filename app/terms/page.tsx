import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Kandangi Sarees",
    description: "Read Kandangi Sarees's Terms of Service. Learn about our policies, user agreements, and terms and conditions.",
    keywords: ["terms of service", "user agreement", "terms and conditions"],
};

export default function TermsPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary-light text-white py-16 md:py-24 px-4">
                <div className="absolute inset-0 bg-[url('/images/sarees/backgrounds/terms_bg.webp')] bg-no-repeat bg-cover opacity-15"></div>
                <div className="max-w-4xl mx-auto text-center z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-lg md:text-xl opacity-95">
                        Please read these terms carefully before using Kandangi Sarees
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
                    <div className=" space-y-8">
                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                1. Acceptance of Terms
                            </h2>
                            <p className="leading-relaxed">
                                By accessing and using the Kandangi Sarees website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                2. Use License
                            </h2>
                            <p className="leading-relaxed mb-4">
                                Permission is granted to temporarily download one copy of the materials (information or software) on Kandangi Sarees's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>Modifying or copying the materials</li>
                                <li>Using the materials for any commercial purpose or for any public display</li>
                                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                                <li>Removing any copyright or other proprietary notations from the materials</li>
                                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                                <li>Violating any applicable laws or regulations</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                3. Disclaimer
                            </h2>
                            <p className="leading-relaxed">
                                The materials on Kandangi Sarees's website are provided on an 'as is' basis. Kandangi Sarees makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                4. Limitations
                            </h2>
                            <p className="leading-relaxed">
                                In no event shall Kandangi Sarees or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Kandangi Sarees website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                5. Accuracy of Materials
                            </h2>
                            <p className="leading-relaxed">
                                The materials appearing on Kandangi Sarees's website could include technical, typographical, or photographic errors. Kandangi Sarees does not warrant that any of the materials on the website are accurate, complete, or current. Kandangi Sarees may make changes to the materials contained on the website at any time without notice.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                6. Links
                            </h2>
                            <p className="leading-relaxed">
                                Kandangi Sarees has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Kandangi Sarees of the site. Use of any such linked website is at the user's own risk.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                7. Modifications
                            </h2>
                            <p className="leading-relaxed">
                                Kandangi Sarees may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                8. Governing Law
                            </h2>
                            <p className="leading-relaxed">
                                These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                9. Product Information & Pricing
                            </h2>
                            <p className="leading-relaxed mb-4">
                                We strive to provide accurate product descriptions and pricing. However:
                            </p>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>Product colors may vary due to monitor settings and photography</li>
                                <li>Prices are subject to change without notice</li>
                                <li>We reserve the right to limit quantities or cancel orders</li>
                                <li>All products are subject to availability</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                10. User Accounts
                            </h2>
                            <p className="leading-relaxed">
                                If you create an account on our website, you are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                11. Payment & Billing
                            </h2>
                            <p className="leading-relaxed">
                                Payment for orders must be made in full before shipment. We accept various payment methods. All transactions are processed securely. You agree not to use fraudulent or invalid payment methods.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                12. Contact Information
                            </h2>
                            <p className="leading-relaxed">
                                If you have any questions about these Terms of Service, please contact us at:
                            </p>
                            <p className="mt-4 ">
                                <strong>Email:</strong> kandangi2025@gmail.com<br />
                                <strong>Address:</strong> Kandangi Sarees — [PENDING — client to supply]
                            </p>
                        </div>

                        <div className="bg-primary/5 border-l-4 border-primary p-6 mt-8">
                            <p className="text-sm ">
                                <strong>Last Updated:</strong> November 2025
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

