"use client";

import { useState } from "react";
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import EmailInput from '@/components/ui/EmailInput';
import { contactFormSchema } from '@/lib/validations/form.schemas';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'email' | 'subject' | 'message', string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validation = contactFormSchema.safeParse(formData);
        if (!validation.success) {
            const errs = validation.error.flatten().fieldErrors;
            setFieldErrors({
                name: errs.name?.[0],
                email: errs.email?.[0],
                subject: errs.subject?.[0],
                message: errs.message?.[0],
            });
            return;
        }
        setFieldErrors({});
        setLoading(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit contact form');
            }

            setSubmitted(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit contact form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary-light text-white py-16 md:py-24 px-4">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/sarees/backgrounds/contact_bg.webp')", opacity: 0.12 }}
                />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-lg md:text-xl opacity-95">
                        We'd love to hear from you. Our team is here to help with any questions.
                    </p>
                </div>
            </section>

            {/* Contact Information & Form */}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-8">
                                Contact Information
                            </h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Email</h3>
                                    <a
                                        href="mailto:kandangi2025@gmail.com"
                                        className="text-primary hover:text-primary-light text-lg transition-colors"
                                    >
                                        kandangi2025@gmail.com
                                    </a>
                                    <p className="text-textSecondary mt-2">We'll respond within 24 hours</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Phone</h3>
                                    <a
                                        href="tel:+917904793851"
                                        className="text-primary hover:text-primary-light text-lg transition-colors"
                                    >
                                        +91 79047 93851
                                    </a>
                                    <p className="text-textSecondary mt-2">Monday – Saturday: 10:00 AM – 6:00 PM IST</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Office Address</h3>
                                    <p className="text-lg leading-relaxed">
                                        Kandangi Sarees<br />
                                        15-B, Venkatachalam Road, First floor<br />
                                        Rs.Puram, Coimbatore<br />
                                        India
                                    </p>
                                </div>

                                <div className="bg-primary/5 rounded-lg p-6">
                                    <h3 className="font-semibold text-lg text-primary mb-2">Business Hours</h3>
                                    <ul className=" space-y-1">
                                        <li><strong>Monday - Saturday:</strong> 10:00 AM – 6:00 PM IST</li>
                                        <li><strong>Sunday:</strong> Closed</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="font-playfair text-3xl font-bold text-primary mb-8">
                                Send us a Message
                            </h2>

                            {submitted && (
                                <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg">
                                    <p className="font-semibold">Thank you for your message!</p>
                                    <p>We'll get back to you as soon as possible.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <Input
                                    id="name"
                                    name="name"
                                    label="Full Name *"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    maxLength={100}
                                    error={fieldErrors.name}
                                    autoComplete="name"
                                />

                                <EmailInput
                                    id="email"
                                    name="email"
                                    label="Email Address *"
                                    value={formData.email}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, email: val }));
                                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    onValidChange={setEmailValid}
                                    externalError={fieldErrors.email}
                                    required
                                    autoComplete="email"
                                />

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="product-inquiry">Product Inquiry</option>
                                        <option value="order-status">Order Status</option>
                                        <option value="return-exchange">Return/Exchange</option>
                                        <option value="shipping-delivery">Shipping &amp; Delivery</option>
                                        <option value="general">General Inquiry</option>
                                    </select>
                                    <p className="mt-1 text-xs min-h-[1rem] text-red-600" aria-live="polite">{fieldErrors.subject ?? ''}</p>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={5}
                                        maxLength={2000}
                                        autoComplete="off"
                                        className={`w-full px-4 py-2 border rounded-md outline-none transition-colors focus:ring-2 ${fieldErrors.message ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-primary focus:border-primary'}`}
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                    <p className="mt-1 text-xs min-h-[1rem] text-red-600" aria-live="polite">{fieldErrors.message ?? ''}</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                How long does delivery take?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                We typically deliver within 5-7 business days for orders within India. International orders may take 10-14 business days depending on customs clearance.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                What's your return policy?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                We do not accept returns. Exchanges are available only in cases of damage or missing items, provided the issue is raised within 7 days of receiving your order. Please contact us with unboxing photos or video for a smooth resolution.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Do you offer wholesale/bulk orders?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Yes, we work with boutiques, shops, and organisations. Please contact us at kandangi2025@gmail.com with your requirements.
                            </p>
                        </details>

                        <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
                            <summary className="font-semibold text-lg text-primary">
                                Are your sarees authentic?
                            </summary>
                            <p className=" mt-4 leading-relaxed">
                                Every saree at Kandangi Sarees is handpicked directly from the weaver. We source from established weaving communities across Tamil Nadu, Andhra Pradesh, Telangana, and Gujarat — and we stand behind every thread.
                            </p>
                        </details>
                    </div>
                </div>
            </section>
        </div>
    );
}

