import type { Metadata } from "next";
import { Poppins, Playfair_Display, Montserrat, Oswald, Dancing_Script, Bebas_Neue, Caveat } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Elegant serif for certificates and formal text
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Modern sans-serif for versatile use
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Condensed display font for bold headlines
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Handwritten/script font for elegant accents
const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Bold display font for impactful text
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

// Casual handwritten font
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wild Mind Editor",
  description: "Professional Design Editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${poppins.variable} ${poppins.className}
          ${playfairDisplay.variable}
          ${montserrat.variable}
          ${oswald.variable}
          ${dancingScript.variable}
          ${bebasNeue.variable}
          ${caveat.variable}
          antialiased
        `}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
