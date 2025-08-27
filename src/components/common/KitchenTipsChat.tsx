
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getKitchenTip } from '@/lib/actions';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, User, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const formSchema = z.object({
  prompt: z.string().min(1, { message: 'Por favor, escribe una pregunta.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function KitchenTipsChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (values: FormValues) => {
    const userMessage: Message = { role: 'user', content: values.prompt };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const answer = await getKitchenTip(values.prompt);
      const assistantMessage: Message = { role: 'assistant', content: answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: 'Lo siento, algo salió mal. Por favor intenta de nuevo.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShare = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '¡Tip copiado!',
        description: 'El consejo ha sido copiado a tu portapapeles.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el consejo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
             <div className="flex items-start gap-3">
               <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.imgur.com/3DPRHtv.png" alt="Fudi Chef"/>
                  <AvatarFallback>FC</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted">
                  <h3 className="text-sm font-semibold mb-1">¡Pregúntale a Fudi Chef!</h3>
                  <p className="text-sm text-muted-foreground">¿No sabes cómo cortar una cebolla sin llorar? ¿Quieres saber el término perfecto para tu carne? ¡Estoy aquí para ayudarte!</p>
                </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.imgur.com/3DPRHtv.png" alt="Fudi Chef"/>
                  <AvatarFallback>FC</AvatarFallback>
                </Avatar>
              )}
              <div className={cn("group rounded-lg max-w-sm whitespace-pre-wrap relative", 
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground p-3 ml-auto' 
                    : 'bg-transparent'
                )}>
                  {message.role === 'assistant' ? (
                     <div className="relative">
                        <Image
                            src="https://imgur.com/LWgHjs9.png"
                            alt="Chat bubble"
                            fill
                            className="object-contain object-left-top"
                        />
                        <div className="relative p-4 pl-6 pr-8 pt-5 text-foreground">
                             <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-bold text-foreground">Fudi Chef</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleShare(message.content)}
                                    >
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm">{message.content}</p>
                        </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{message.content}</p>
                    </>
                  )}
                </div>
               {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://i.imgur.com/3DPRHtv.png" alt="Fudi Chef" />
                <AvatarFallback>FC</AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-lg bg-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="Escribe tu pregunta aquí..." {...field} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
