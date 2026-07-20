import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Wishlist | Kandangi Sarees",
    description: "View and manage your saved sarees on Kandangi Sarees.",
    alternates: { canonical: "https://kandangisarees.com/wishlist" },
};

export default function WishlistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
