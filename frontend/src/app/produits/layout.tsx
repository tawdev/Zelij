import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue Trottinettes Électriques",
  description: "Découvrez notre large gamme de trottinettes électriques à Marrakech. Les meilleures marques au meilleur prix : Dualtron, Ducati, Ecoxtream, Urban Glide et plus encore.",
  keywords: [
    "catalogue trottinette marrakech",
    "prix trottinette électrique marrakech",
    "marques trottinette électrique",
    "accessoires trottinette marrakech",
    "pièces détachées trottinette marrakech",
    "trottinette électrique adulte marrakech",
    "trottinette électrique puissante maroc"
  ],
};

export default function ProduitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
