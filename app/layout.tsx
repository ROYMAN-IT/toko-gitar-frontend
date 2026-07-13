import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitarKu - The Guitar Vault",
  description: "Your Online Sanctuary for Guitars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ⭐ TAMBAHKAN SCRIPT MIDTRANS DI SINI */}
        <script
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          async

        />
      </head>
      <body 
        className="min-h-screen bg-[#1E1E1E] antialiased bg-repeat-y bg-cover bg-top"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 15, 0.85), rgba(15, 15, 15, 0.9)), url('/background keranjang2.jpg')` 
        }}
      >
        {/* linear-gradient di atas berfungsi sebagai filter pembantu agar gambar gitarnya agak gelap, sehingga tulisan putih di atasnya tidak silau dan tetap tajam dibaca */}
        {children}
      </body>
    </html>
  );
}