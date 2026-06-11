import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Silk Saree Collection | Authentic Handwoven Sarees | PratyagraSilks',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    description: 'Browse our exquisite collection of authentic handwoven silk sarees. Kanjivaram, Banarasi, Tussar, Mysore, and more. Premium quality silk sarees from India\'s finest weavers.',
    keywords: [
        'silk sarees collection',
        'buy silk sarees online',
        'handwoven sarees',
        'kanjivaram sarees',
        'banarasi sarees',
        'tussar silk',
        'luxury silk sarees',
        'indian silk sarees',
        'authentic silk sarees',
        'traditional sarees',
    ],
    openGraph: {
        title: 'Silk Saree Collection | PratyagraSilks',
        description: 'Browse our exquisite collection of authentic handwoven silk sarees from India\'s finest weavers.',
        url: 'https://pratyagrasilks.com/collection',
        siteName: 'PratyagraSilks',
        locale: 'en_IN',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Silk Saree Collection | PratyagraSilks',
        description: 'Browse our exquisite collection of authentic handwoven silk sarees.',
    },
    alternates: {
        canonical: 'https://pratyagrasilks.com/collection',
    },
};

export default function CollectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
