import { Metadata } from "next";
import { siteMetadata } from "@/lib/seo/config";

export const metadata: Metadata = {
    title: "Contact Pratyagra Silks | Customer Support & Inquiries",
    description: "Get in touch with Pratyagra Silks. We're here to help with product inquiries, orders, and customer support. Contact us via email or phone.",
    keywords: ["contact pratyagra silks", "customer support", "product inquiries", "shipping info"],
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'ContactPage',
                '@id': `${siteMetadata.baseUrl}/contact/#webpage`,
                url: `${siteMetadata.baseUrl}/contact`,
                name: 'Contact PratyagraSilks | Customer Support & Inquiries',
                description: 'Get in touch with PratyagraSilks. We are here to help with product inquiries, orders, and customer support.',
                breadcrumb: {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Home',
                            item: siteMetadata.baseUrl,
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: 'Contact Us',
                            item: `${siteMetadata.baseUrl}/contact`,
                        },
                    ],
                },
            },
            {
                '@type': 'LocalBusiness',
                '@id': `${siteMetadata.baseUrl}/#localbusiness`,
                name: 'Pratyagra Silks',
                image: `${siteMetadata.baseUrl}/logo.png`,
                telephone: '+917358866646',
                email: 'info@pratyagrasilks.com',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'NO 178, 2nd Floor A Rammachnadra Road, RS Puram',
                    addressLocality: 'Coimbatore',
                    addressRegion: 'Tamil Nadu',
                    postalCode: '641002',
                    addressCountry: 'IN',
                },
                priceRange: '$$$$',
                openingHoursSpecification: [
                    {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                        opens: '09:00',
                        closes: '18:00',
                    },
                    {
                        '@type': 'OpeningHoursSpecification',
                        dayOfWeek: 'Saturday',
                        opens: '10:00',
                        closes: '16:00',
                    },
                ],
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            {children}
        </>
    );
}
