"use client";

import type { ShoppingListItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, ShoppingCart } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingListItem[];
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, newValues: Partial<ShoppingListItem>) => void;
  onClear: () => void;
}

export function ShoppingList({ items, onToggle, onRemove, onClear }: ShoppingListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <ShoppingCart className="h-16 w-16 mb-4" />
        <h3 className="text-xl font-semibold">Tu lista de compras está vacía</h3>
        <p className="mt-2">Añade ingredientes de tus recetas favoritas.</p>
      </div>
    );
  }

  const groupedItems = items.reduce((acc, item) => {
    const key = item.recipeName || 'Varios';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {Object.entries(groupedItems).map(([recipeName, ingredients]) => (
            <div key={recipeName}>
              <h4 className="font-semibold mb-2 text-primary">{recipeName}</h4>
              <ul className="space-y-2">
                {ingredients.map(item => (
                  <li key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.checked}
                      onCheckedChange={() => onToggle(item.id)}
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={`flex-grow text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {item.quantity ? item.quantity.toFixed(2).replace(/\.00$/, '').replace(/\.d0$/, '') : ''} {item.unit || ''} {item.name}
                    </label>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button variant="destructive" className="w-full" onClick={onClear}>
          Limpiar Lista
        </Button>
      </div>
    </div>
  );
}
