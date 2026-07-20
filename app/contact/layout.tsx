import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact KandangiSarees | Customer Support & Inquiries",
    description: "Get in touch with KandangiSarees. We're here to help with product inquiries, orders, and customer support. Contact us via email or phone.",
    keywords: ["contact kandangisarees.", "customer support", "product inquiries", "shipping info"],
    alternates: { canonical: "https://kandangisarees.com/contact" },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
