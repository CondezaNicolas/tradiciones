import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/seo";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Revista digital de cultura chilena`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  publisher: SITE_NAME,
  category: "culture",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Revista digital de cultura chilena`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/hero-background.webp",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Revista digital de cultura chilena`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-background.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "ZOSUxorSSfBJ7Mx9QOqe45c7491PIxfUjLx9g_T5i88",
  },
  icons: {
    icon: "/images/logo.ico",
    shortcut: "/images/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${newsreader.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body">
        {children}
      </body>
    </html>
  );
}
