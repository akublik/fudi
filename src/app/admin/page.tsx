
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, ArrowLeft, ShieldX, Users, Bell, Store, BarChart } from 'lucide-react';
import Link from 'next/link';
import { sendNotificationAction } from '@/lib/actions';
import type { SendNotificationInput } from '@/lib/schemas';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserList } from '@/components/admin/UserList';
import { SupermarketManager } from '@/components/admin/SupermarketManager';
import { AIMonitor } from '@/components/admin/AIMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AdminPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const form = useForm<SendNotificationInput>({
        defaultValues: {
            title: '',
            body: '',
            topic: 'all_users',
        },
    });
    
    useEffect(() => {
        // Redirect if not admin and auth is not loading
        if (!authLoading && !isAdmin) {
            router.replace('/');
        }
    }, [isAdmin, authLoading, router]);

    const onSubmit = async (data: SendNotificationInput) => {
        setIsLoading(true);
        try {
            const result = await sendNotificationAction(data);
            if (result?.success) {
                toast({
                    title: '¡Notificación Enviada!',
                    description: `Mensaje enviado con éxito. ID: ${result.messageId}`,
                });
                form.reset();
            } else {
                throw new Error(result?.error || 'Ocurrió un error desconocido al enviar la notificación.');
            }
        } catch (error: any) {
             toast({
                title: 'Error al Enviar',
                description: error.message || 'No se pudo completar la solicitud.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (authLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-muted/20 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Verificando acceso...</p>
            </div>
        );
    }
    
    if (!isAdmin) {
         return (
            <div className="flex flex-col min-h-screen bg-muted/20 items-center justify-center text-center p-4">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldX className="h-8 w-8 text-destructive" />
                            Acceso Denegado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No tienes permiso para acceder a esta página.</p>
                         <Button asChild variant="outline" className="mt-6">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al Inicio
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <main className="container mx-auto px-4 py-8 flex-grow">
                 <Button asChild variant="outline" className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Inicio
                    </Link>
                </Button>
                <h1 className="font-headline text-4xl mb-8">Panel de Administración</h1>
                
                <Tabs defaultValue="notifications" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="notifications">
                            <Bell className="mr-2 h-4 w-4" /> Notificaciones
                        </TabsTrigger>
                        <TabsTrigger value="users">
                            <Users className="mr-2 h-4 w-4" /> Usuarios
                        </TabsTrigger>
                        <TabsTrigger value="supermarkets">
                            <Store className="mr-2 h-4 w-4" /> Supermercados
                        </TabsTrigger>
                         <TabsTrigger value="ai-monitor">
                            <BarChart className="mr-2 h-4 w-4" /> Monitor IA
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="notifications">
                        <Card className="w-full shadow-lg">
                            <CardHeader>
                                <CardTitle>Enviar Notificaciones Push</CardTitle>
                                <CardDescription>Envía un mensaje a todos los usuarios que tengan las notificaciones activadas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Título</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ej: ¡Nueva receta disponible!" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="body"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mensaje</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Ej: No te pierdas nuestra nueva receta de Lasaña..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Topic</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled />
                                                    </FormControl>
                                                     <FormDescription>Actualmente solo se soportan notificaciones al topic 'all_users'.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                                            Enviar Notificación
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <UserList />
                    </TabsContent>

                    <TabsContent value="supermarkets">
                        <SupermarketManager />
                    </TabsContent>

                    <TabsContent value="ai-monitor">
                        <AIMonitor />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
