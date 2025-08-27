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
import { Loader2, Send, Sparkles, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

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

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
              <Sparkles className="mx-auto h-12 w-12 mb-4 text-primary" />
              <h3 className="text-lg font-semibold">¡Pregúntale al Chef Fudi!</h3>
              <p>¿No sabes cómo cortar una cebolla sin llorar? ¿Quieres saber el término perfecto para tu carne? ¡Estoy aquí para ayudarte!</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://i.imgur.com/3DPRHtv.png" alt="Chef Fudi"/>
                  <AvatarFallback>CF</AvatarFallback>
                </Avatar>
              )}
              <div className={cn("p-3 rounded-lg max-w-sm whitespace-pre-wrap", 
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              )}>
                <p className="text-sm">{message.content}</p>
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
                <AvatarImage src="https://i.imgur.com/3DPRHtv.png" alt="Chef Fudi" />
                <AvatarFallback>CF</AvatarFallback>
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
