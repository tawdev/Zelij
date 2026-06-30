import type { Metadata } from "next";
import "./globals.css";

import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import PublicShell from "./components/PublicShell";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CompareProvider } from "./context/CompareContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationOverlay from "./components/NotificationOverlay";
import ScrollToTop from "./components/ScrollToTop";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zelij-maroc.com"),

  title: {
    default: "Zelij Maroc – Zellige Artisanal de Luxe | Carreaux Faits Main",
    template: "%s | Zelij Maroc",
  },

  description:
    "Zelij Maroc : La référence du zellige artisanal marocain de luxe. Carreaux en terre cuite émaillée taillés à la main par nos maâlems de Fès. Zellige traditionnel, bejmat, mosaïque et créations uniques. Livraison partout au Maroc et à l'international.",

  keywords: [
    "zellige maroc",
    "carreau zellige",
    "zellige artisanal",
    "zellige fès",
    "zellige marrakech",
    "zellige traditionnel",
    "bejmat",
    "tadelakt",
    "zellige bleu majorelle",
    "zellige vert émeraude",
    "carrelage marocain",
    "mosaïque marocaine",
    "zellige pas cher",
    "zellige prix m2",
    "décoration marocaine",
    "riad maroc",
    "zellige mural",
    "zellige sol",
  ],

  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: "https://zelij-maroc.com",
    siteName: "Zelij Maroc",
    title: "Zelij Maroc – Zellige Artisanal de Luxe",
    description:
      "Zellige artisanal marocain de luxe, taillé à la main par nos maâlems. Carreaux authentiques, prix au m², livraison partout au Maroc.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zelij Maroc – Zellige Artisanal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Zelij Maroc – Zellige Artisanal de Luxe",
    description: "Zellige artisanal marocain, taillé à la main par nos maâlems.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://zelij-maroc.com",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Zelij Maroc",
              "image": "https://zelij-maroc.com/icon.png",
              "@id": "https://zelij-maroc.com",
              "url": "https://zelij-maroc.com",
              "telephone": "+212676499929",
              "description": "Zellige artisanal marocain de luxe, taillé à la main par nos maâlems de Fès.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Marrakech, Maroc",
                "addressLocality": "Marrakech",
                "postalCode": "40000",
                "addressCountry": "MA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 31.6295,
                "longitude": -7.9811
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                "opens": "09:00",
                "closes": "19:00"
              },
              "sameAs": [
                "https://www.facebook.com/zelijmaroc",
                "https://www.instagram.com/zelijmaroc"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://zelij-maroc.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://zelij-maroc.com/produits?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <NotificationProvider>
            <SettingsProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <CartProvider>
                      <PublicShell>{children}</PublicShell>
                      <NotificationOverlay />
                      <ScrollToTop />
                    </CartProvider>
                  </CompareProvider>
                </WishlistProvider>
              </AuthProvider>
            </SettingsProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
