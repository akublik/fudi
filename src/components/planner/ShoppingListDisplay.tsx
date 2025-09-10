
"use client";

import { useState } from 'react';
import type { ShoppingIngredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShoppingListDisplayProps {
  items: ShoppingIngredient[];
}

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

export function ShoppingListDisplay({ items }: ShoppingListDisplayProps) {
  const { toast } = useToast();
  const [note, setNote] = useState('');

  const generateShareableText = () => {
    let text = 'Fudi Chef - Lista de Compras Semanal\nwww.fudichef.com\n\n';

    if (note.trim()) {
      text += `*Nota Adicional:*\n${note.trim()}\n\n`;
    }

    text += '🛒 *Lista de Ingredientes*\n';
    items.forEach(item => {
      text += `- ${item.quantity} ${item.name}\n`;
    });

    return text;
  };

  const handleShare = (medium: 'whatsapp' | 'clipboard') => {
    const text = generateShareableText();
    if (medium === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "¡Lista copiada!",
        description: "Puedes pegarla en tu app de mensajería o correo.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <span className="font-semibold">{item.quantity}</span>
            <span className="text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
      
      <div className="space-y-2 pt-4">
        <Label htmlFor="shopping-note">Notas Adicionales</Label>
        <Textarea 
          id="shopping-note"
          placeholder="Ej: Comprar el pan en la panadería de la esquina..." 
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button className="flex-1" onClick={() => handleShare('whatsapp')}>
          <WhatsAppIcon /> Compartir por WhatsApp
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => handleShare('clipboard')}>
          <Copy /> Copiar Lista
        </Button>
      </div>
    </div>
  );
}
