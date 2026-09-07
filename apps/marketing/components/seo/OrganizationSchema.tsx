import { siteMetadata } from '@/lib/seo/config';

const schema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Organization',
            '@id': `${siteMetadata.baseUrl}/#organization`,
            name: 'Pratyagra Silks',
            url: siteMetadata.baseUrl,
            logo: `${siteMetadata.baseUrl}/logo.png`,
            description:
                'India\'s premier destination for heirloom handwoven luxury silk sarees. Master weavers crafting investment-grade Kanjivaram, Banarasi, and pure silk sarees — each piece a testament to generational craftsmanship.',
            brand: {
                '@type': 'Brand',
                name: 'Pratyagra Silks',
            },
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
            },
        },
        {
            '@type': 'WebSite',
            '@id': `${siteMetadata.baseUrl}/#website`,
            url: siteMetadata.baseUrl,
            name: siteMetadata.siteName,
            publisher: { '@id': `${siteMetadata.baseUrl}/#organization` },
            potentialAction: {
                '@type': 'SearchAction',
                target: `${siteMetadata.baseUrl}/collection?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        },
    ],
};

export default function OrganizationSchema() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
