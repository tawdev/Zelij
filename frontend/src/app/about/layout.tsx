import { Metadata } from "next";

export const metadata: Metadata = {
  title: "À Propos de Nous",
  description: "Découvrez MOL Trottinette, votre expert en mobilité urbaine à Marrakech. Showroom, service technique et passion pour les trottinettes électriques premium.",
  keywords: [
    "expert trottinette marrakech",
    "boutique trottinette marrakech",
    "showroom mol trottinette",
    "histoire mol trottinette",
    "service après-vente trottinette marrakech",
    "mobilité urbaine marrakech"
  ],
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
