import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Marques Premium",
  description: "Explorez les meilleures marques de trottinettes électriques disponibles chez MOL Trottinette Marrakech. Dualtron, Teverun, Ducati, Kaabo et bien d'autres.",
  keywords: [
    "marques trottinette marrakech",
    "dualtron marrakech",
    "teverun marrakech",
    "ducati trottinette marrakech",
    "kaabo marrakech",
    "kukirin marrakech",
    "okai marrakech",
    "meilleure marque trottinette électrique maroc"
  ],
};

export default function MarquesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
