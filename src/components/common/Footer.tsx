import { MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-6 mt-8 border-t">
      <div className="container mx-auto text-center text-muted-foreground">
        <p className="flex items-center justify-center gap-2">
          André Kublik -
          <a
            href="https://wa.me/593992650852"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Whatsapp: +593 992650852</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
