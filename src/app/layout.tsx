import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Fudi Cheff ¿Qué cocino hoy?',
  description: 'Recetas deliciosas para tus comidas dulces, saladas, y ahora también bebidas',
  manifest: '/manifest.json',
  icons: {
    icon: 'https://i.imgur.com/5H2pCKQ.png',
    apple: 'https://i.imgur.com/LWgHjs9.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
