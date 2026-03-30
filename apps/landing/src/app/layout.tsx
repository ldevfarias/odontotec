import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/nav";

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OdontoEhTec",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "inLanguage": "pt-BR",
  "url": "https://odontoehtec.com.br",
  "description": "Software de gestão odontológica com prontuário digital, agenda inteligente e controle financeiro. Equipe ilimitada por R$ 49,99/mês.",
  "offers": {
    "@type": "Offer",
    "price": "49.99",
    "priceCurrency": "BRL",
    "priceValidUntil": "2027-12-31",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "Prontuário odontológico digital",
    "Agenda inteligente com lembretes automáticos",
    "Gestão financeira e orçamentos",
    "Equipe e usuários ilimitados",
    "Galeria de imagens clínicas",
    "Receituário e atestados",
    "Acesso multiplataforma"
  ]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#41b883",
};

export const metadata: Metadata = {
  title: "OdontoEhTec | Software de Gestão Odontológica",
  description: "Software de gestão odontológica completo: prontuário digital, agenda inteligente e financeiro. Equipe ilimitada por R$ 49,99/mês. Teste grátis por 7 dias.",
  alternates: { canonical: "https://odontoehtec.com.br" },
  openGraph: {
    title: "OdontoEhTec | Software de Gestão Odontológica",
    description: "Prontuário, agenda e financeiro em um único lugar. Equipe ilimitada. R$ 49,99/mês, sem surpresas.",
    url: "https://odontoehtec.com.br",
    siteName: "OdontoEhTec",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OdontoEhTec | Software de Gestão Odontológica",
    description: "Gerencie sua clínica odontológica com equipe ilimitada. R$ 49,99/mês, sem letras miúdas.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
      </head>
      <body className="antialiased selection:bg-primary/20">
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
