import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Kandangi Sarees",
    description: "Read Kandangi Sarees's Privacy Policy. Learn how we collect, use, and protect your personal information.",
    keywords: ["privacy policy", "data protection", "personal information"],
};

export default function PrivacyPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary-light text-white py-16 md:py-24 px-4">
                <div className="absolute inset-0 bg-[url('/images/sarees/backgrounds/privacy_bg.webp')] bg-no-repeat bg-cover opacity-15"></div>
                <div className="max-w-4xl mx-auto text-center z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-lg md:text-xl opacity-95">
                        Your privacy is important to us. Learn how we protect your data.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
                    <div className=" space-y-8">
                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                1. Introduction
                            </h2>
                            <p className="leading-relaxed">
                                Kandangi Sarees ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                2. Information We Collect
                            </h2>
                            <p className="leading-relaxed mb-4">
                                We may collect information about you in a variety of ways:
                            </p>
                            <h3 className="font-semibold text-lg text-gray-900 mt-4 mb-2">Personal Information:</h3>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>Name and surname</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Postal address</li>
                                <li>Payment information</li>
                                <li>Order history</li>
                            </ul>

                            <h3 className="font-semibold text-lg text-gray-900 mt-4 mb-2">Automatically Collected Information:</h3>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>IP address</li>
                                <li>Browser type and version</li>
                                <li>Pages visited and time spent</li>
                                <li>Referring/exit pages</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                3. Use of Your Information
                            </h2>
                            <p className="leading-relaxed mb-4">
                                We use the information we collect in the following ways:
                            </p>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>Process transactions and send related information</li>
                                <li>Email marketing communications (with your consent)</li>
                                <li>Improve our website and services</li>
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Monitor and analyze usage patterns and trends</li>
                                <li>Detect, prevent, and address fraud and security issues</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                4. Disclosure of Your Information
                            </h2>
                            <p className="leading-relaxed mb-4">
                                We may share your information in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>With service providers who assist us in operating our website and conducting our business</li>
                                <li>To comply with legal obligations, court orders, or government requests</li>
                                <li>To protect our rights, privacy, safety, or property</li>
                                <li>In connection with a merger, acquisition, or sale of assets</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                5. Data Security
                            </h2>
                            <p className="leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                6. Cookies and Tracking Technologies
                            </h2>
                            <p className="leading-relaxed mb-4">
                                We use cookies and similar tracking technologies to enhance your experience on our website. These may include:
                            </p>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>Session cookies (temporary, deleted when you close your browser)</li>
                                <li>Persistent cookies (remain on your device for a set period)</li>
                                <li>Analytics cookies (to understand how you use our website)</li>
                                <li>Marketing cookies (to personalize content and advertisements)</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                You can control cookie settings through your browser. However, disabling cookies may affect the functionality of our website.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                7. Third-Party Links
                            </h2>
                            <p className="leading-relaxed">
                                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies before providing any personal information.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                8. Your Privacy Rights
                            </h2>
                            <p className="leading-relaxed mb-4">
                                Depending on your location, you may have certain rights regarding your personal information:
                            </p>
                            <ul className="list-disc list-inside space-y-2  ml-4">
                                <li>Right to access your personal data</li>
                                <li>Right to correct inaccurate data</li>
                                <li>Right to request deletion of your data</li>
                                <li>Right to opt-out of marketing communications</li>
                                <li>Right to data portability</li>
                            </ul>
                            <p className="leading-relaxed mt-4">
                                To exercise any of these rights, please contact us at kandangi2025@gmail.com.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                9. Marketing Communications
                            </h2>
                            <p className="leading-relaxed">
                                We may send you promotional emails about our products, services, and special offers. You can opt-out of these communications at any time by clicking the "Unsubscribe" link in our emails or by contacting us directly. Please note that even if you opt-out of marketing emails, we will still send you transactional emails related to your orders.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                10. Children's Privacy
                            </h2>
                            <p className="leading-relaxed">
                                Our website is not directed to children under 18 years old. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child without parental consent, we will promptly delete such information.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                11. International Data Transfers
                            </h2>
                            <p className="leading-relaxed">
                                Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using our website, you consent to such transfers.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                12. Changes to This Privacy Policy
                            </h2>
                            <p className="leading-relaxed">
                                We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of significant changes by posting the updated policy on our website and updating the "Last Updated" date. Your continued use of our website constitutes your acceptance of the updated Privacy Policy.
                            </p>
                        </div>

                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-4">
                                13. Contact Us
                            </h2>
                            <p className="leading-relaxed">
                                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
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

