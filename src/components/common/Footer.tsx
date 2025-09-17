
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-6 mt-8 border-t">
      <div className="container mx-auto text-center text-muted-foreground">
        <p>
          Fudi Chef todos los derechos reservados 2025 - info@fudichef.com - +593 0992650852
        </p>
        <div className="flex justify-center gap-4 mt-2 text-sm">
            <Link href="/terminos" className="hover:text-primary hover:underline">
                Términos y Condiciones
            </Link>
            <span>|</span>
            <Link href="/privacidad" className="hover:text-primary hover:underline">
                Política de Privacidad
            </Link>
        </div>
      </div>
    </footer>
  );
}
