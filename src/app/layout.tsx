import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';

const APP_NAME = "Fudi Chef";
const APP_DEFAULT_TITLE = "Fudi Chef ¿qué cocino hoy? Vibe Cooking";
const APP_TITLE_TEMPLATE = "%s - Fudi Chef";
const APP_DESCRIPTION = "Recetas deliciosas para tus comidas dulces, saladas, y ahora también bebidas";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff9864",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/icon.png' />
        <Script id="firebase-sdk" src="https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js" strategy="lazyOnload"></Script>
        <Script id="firebase-analytics" src="https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js" strategy="lazyOnload"></Script>
        <Script id="firebase-auth" src="https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js" strategy="lazyOnload"></Script>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
