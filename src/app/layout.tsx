import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yuda Arif Rahman | Web Developer & IoT",
  description: "Web developer yang berfokus pada pembuatan sistem modern berbasis web dan IoT integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <div className="glow-bg">
          <div className="blob-1"></div>
          <div className="blob-2"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
