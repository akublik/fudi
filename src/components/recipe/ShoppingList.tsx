
"use client";

import { useState } from 'react';
import type { ShoppingListItem, UserInfo, Supermarket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, ShoppingCart, Share2, Copy, Loader2, Send, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UserInfoForm } from '../forms/UserInfoForm';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createShoppingCart, findNearbyStores } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface ShoppingListProps {
  items: ShoppingListItem[];
  userInfo: UserInfo;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, newValues: Partial<ShoppingListItem>) => void;
  onClear: () => void;
  onAddItem: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void;
  onSaveUserInfo: (data: UserInfo) => void;
  isPlannerView?: boolean;
}

export function ShoppingList({ items, userInfo, onToggle, onRemove, onUpdate, onClear, onAddItem, onSaveUserInfo, isPlannerView = false }: ShoppingListProps) {
  const { toast } = useToast();
  const [shopperNote, setShopperNote] = useState('');
  const [isCreatingCart, setIsCreatingCart] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [nearbyStores, setNearbyStores] = useState<Supermarket[]>([]);
  const [isFindingStores, setIsFindingStores] = useState(false);
  const { user } = useAuth();
  
  const generateShareableText = () => {
    let text = 'Fudi Chef\nwww.fudichef.com\n\n';
    
    if (userInfo.name || userInfo.address || userInfo.whatsapp) {
      text += '*Enviado por:*\n';
      if (userInfo.name) text += `- *Nombre:* ${userInfo.name}\n`;
      if (userInfo.address) text += `- *Dirección:* ${userInfo.address}\n`;
      if (userInfo.whatsapp) text += `- *WhatsApp:* ${userInfo.whatsapp}\n`;
      text += '\n';
    }

    if (shopperNote.trim()) {
      text += `*Nota para el Shopper:*\n${shopperNote.trim()}\n\n`;
    }

    text += '🛒 *Lista de Compras*\n\n';

    const groupedItems = items.reduce((acc, item) => {
      const key = isPlannerView ? "Plan Semanal" : (item.recipeName || 'Varios');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);


    Object.entries(groupedItems).forEach(([recipeName, ingredients]) => {
      if (!isPlannerView) {
        text += `*${recipeName}*\n`;
      }
      ingredients.forEach(item => {
        text += `- ${item.quantity ? item.quantity.toString().replace(/\.00$/, '').replace(/\.d0$/, '') : ''} ${item.unit || ''} ${item.name}`;
        if (item.notes) {
          text += ` (${item.notes})`;
        }
        text += '\n';
      });
      text += '\n';
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
  
  const handleFindNearbyStores = () => {
    setIsFindingStores(true);
    setNearbyStores([]);
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalización no soportada",
        description: "Tu navegador no permite obtener tu ubicación.",
        variant: "destructive",
      });
      setIsFindingStores(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const result = await findNearbyStores({ latitude, longitude });
        if(result.stores.length === 0){
          toast({
            title: "No hay tiendas cerca",
            description: "No encontramos supermercados afiliados en un radio de 20km.",
          });
        }
        setNearbyStores(result.stores);
      } catch (error) {
        toast({
          title: "Error al buscar tiendas",
          description: "No se pudieron obtener las tiendas cercanas.",
          variant: "destructive",
        });
      } finally {
        setIsFindingStores(false);
      }
    }, (error) => {
      toast({
        title: "Error de ubicación",
        description: "No se pudo obtener tu ubicación. Asegúrate de haber dado los permisos necesarios.",
        variant: "destructive",
      });
      setIsFindingStores(false);
    });
  }

  const handleCreateCart = async (storeName: string) => {
    setIsCreatingCart(true);
    setSelectedStore(storeName);
    try {
      const cartItems = items.map(item => {
        const mockPrice = parseFloat((Math.random() * (10 - 1) + 1).toFixed(2));
        return {
          name: item.name,
          quantity: `${item.quantity || ''} ${item.unit || ''}`.trim(),
          price: mockPrice * (item.quantity || 1)
        }
      });

      const result = await createShoppingCart({
        items: cartItems,
        store: storeName,
        userId: user?.uid,
      });

      if (result) {
        toast({
          title: "Simulación Exitosa",
          description: (
            <div>
              <p>Tu pedido ha sido enviado a <strong>{storeName}</strong>.</p>
              <p className="mt-2 text-xs"><strong>URL de Checkout:</strong> <a href={result.checkoutUrl} target="_blank" rel="noopener noreferrer" className="underline">{result.checkoutUrl}</a></p>
              <p className="text-xs"><strong>ID de Seguimiento:</strong> {result.trackingId}</p>
            </div>
          ),
          duration: 9000,
        });
        window.open(result.checkoutUrl, '_blank');
      } else {
        throw new Error("No se pudo crear el carrito.");
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error en la simulación",
        description: "No se pudo completar la simulación de compra.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCart(false);
      setSelectedStore('');
    }
  };
  
  const mainContent = () => {
    if (items.length === 0) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-8 min-h-[200px]">
          <ShoppingCart className="h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold">Tu lista de compras está vacía</h3>
          <p className="mt-2">Añade ingredientes de tus recetas favoritas o agrégalos manualmente aquí abajo.</p>
        </div>
      );
    }

    const groupedItems = items.reduce((acc, item) => {
      const key = isPlannerView ? "Plan Semanal" : (item.recipeName || 'Varios');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);
    
    return (
       <div className={`${isPlannerView ? '' : 'p-4'} space-y-4`}>
        {Object.entries(groupedItems).map(([recipeName, ingredients]) => (
          <div key={recipeName}>
             {!isPlannerView && <h4 className="font-semibold mb-2 text-primary">{recipeName}</h4>}
            <ul className="space-y-2">
              {ingredients.map(item => (
                <li key={item.id} className="flex flex-col gap-2 p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.checked}
                      onCheckedChange={() => onToggle(item.id)}
                    />
                    <div className={`flex-grow grid grid-cols-[50px_60px_1fr] md:grid-cols-[60px_80px_1fr] items-center gap-2 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdate(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-sm"
                      />
                      <Input
                        value={item.unit || ''}
                        onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
                         className="h-8 text-sm"
                      />
                      <Input
                        value={item.name}
                        onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                        className="h-8 text-sm font-medium"
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onRemove(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                      <Input
                        placeholder="Observaciones..."
                        value={item.notes || ''}
                        onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
                        className={`h-8 text-sm flex-grow ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                      />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }
  
  const shoppingListContainerClasses = isPlannerView ? "space-y-4" : "flex flex-col h-full";
  const mainContentWrapperClasses = isPlannerView ? "" : "flex-grow";
  const controlsWrapperClasses = isPlannerView ? "" : "p-4 border-t space-y-4 shrink-0 overflow-y-auto max-h-[45vh]";


  return (
    <div className={shoppingListContainerClasses}>
      <ScrollArea className={mainContentWrapperClasses}>
        {mainContent()}
      </ScrollArea>
      <div className={controlsWrapperClasses}>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="user-info">
            <AccordionTrigger>Información de Contacto (para compartir)</AccordionTrigger>
            <AccordionContent>
              <UserInfoForm onSave={onSaveUserInfo} initialData={userInfo} card={false}/>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="add-item">
            <AccordionTrigger>Añadir Ingrediente Manualmente</AccordionTrigger>
            <AccordionContent>
              <AddItemForm onAddItem={onAddItem} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Separator />

        <div className="space-y-2">
            <Label htmlFor="shopper-note">Nota al Shopper</Label>
            <Textarea 
              id="shopper-note"
              placeholder="Ej: Por favor, que los aguacates estén listos para hoy..." 
              value={shopperNote}
              onChange={(e) => setShopperNote(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleShare('whatsapp')} disabled={items.length === 0}>
              <Share2 className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" onClick={() => handleShare('clipboard')} disabled={items.length === 0}>
              <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-semibold text-center">Enviar Pedido a Supermercado (Simulado)</h4>
          <Button onClick={handleFindNearbyStores} disabled={!user || isFindingStores} className="w-full">
            {isFindingStores ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MapPin className="mr-2 h-4 w-4" />}
            Buscar tiendas cercanas
          </Button>
          
          {nearbyStores.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Selecciona una tienda para enviar tu pedido:</p>
              <div className="grid grid-cols-2 gap-2">
                {nearbyStores.map(store => (
                  <Button
                    key={store.id}
                    variant="outline"
                    className="h-auto flex flex-col items-center gap-2 p-3"
                    onClick={() => handleCreateCart(store.name)}
                    disabled={isCreatingCart}
                  >
                    {isCreatingCart && selectedStore === store.name ? (
                      <Loader2 className="h-6 w-6 animate-spin"/>
                    ) : (
                      <Image src={store.logoUrl} alt={store.name} width={40} height={40} className="object-contain" />
                    )}
                    <div className="text-center">
                      <p className="font-semibold">{store.name}</p>
                      <p className="text-xs text-muted-foreground">{store.distance?.toFixed(1)} km</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <Button variant="destructive" className="w-full" onClick={onClear} disabled={items.length === 0}>
          Limpiar Lista
        </Button>
      </div>
    </div>
  );
}

function AddItemForm({ onAddItem }: { onAddItem: (item: Omit<ShoppingListItem, 'id' | 'checked'>) => void; }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddItem({
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit: unit.trim(),
      recipeName: 'Varios'
    });
    setName('');
    setQuantity('');
    setUnit('');
  };

  return (
    <form onSubmit={handleAdd} className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-grow"
        />
        <Input
          type="number"
          placeholder="Cant."
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20"
        />
        <Input
          placeholder="Unidad"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-24"
        />
      </div>
      <Button type="submit" className="w-full">Añadir a la lista</Button>
    </form>
  );
}
