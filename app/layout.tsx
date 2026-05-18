import type { Metadata } from "next";
import { Playfair_Display, Literata } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const literata = Literata({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Syncro",
  description: "Seguimiento de series y películas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${literata.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-[#1b1012] text-[#f4dde0]">
        {children}
      </body>
    </html>
  );
}
