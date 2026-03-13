import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OdontoEhTec | Seu consultório no seu ritmo",
  description: "Gerencie sua clínica odontológica com equipe ilimitada, prontuário, agenda e financeiro. Design premium e um preço único transparente.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#41b883",
  openGraph: {
    title: "OdontoEhTec | Gestão Odontológica Elegante",
    description: "Equipe ilimitada. Gestão visual. Prontuário rápido. Tudo o que sua clínica precisa por um preço único.",
    url: "https://odontoehtec.com.br",
    siteName: "OdontoEhTec",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dashboard do OdontoEhTec",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OdontoEhTec | Gestão Odontológica",
    description: "Gerencie sua clínica odontológica com equipe ilimitada. Preço único, sem letras miúdas.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
