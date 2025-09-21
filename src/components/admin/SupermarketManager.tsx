
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSupermarketsAction, addSupermarketAction, deleteSupermarketAction } from '@/lib/actions';
import type { Supermarket } from '@/lib/types';
import { AddSupermarketInputSchema, type AddSupermarketInput } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, PlusCircle, Store, Globe, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function SupermarketManager() {
    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<AddSupermarketInput>({
        resolver: zodResolver(AddSupermarketInputSchema),
        defaultValues: {
            name: '',
            logoUrl: '',
            latitude: 0,
            longitude: 0,
        },
    });

    const fetchSupermarkets = async () => {
        setIsLoading(true);
        try {
            const supermarketList = await getSupermarketsAction();
            setSupermarkets(supermarketList);
        } catch (error) {
            console.error("Failed to fetch supermarkets:", error);
            toast({ title: 'Error', description: 'No se pudieron cargar los supermercados.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSupermarkets();
    }, []);

    const handleAddSubmit = async (data: AddSupermarketInput) => {
        setIsSubmitting(true);
        try {
            const newSupermarket = await addSupermarketAction(data);
            setSupermarkets(prev => [...prev, newSupermarket]);
            form.reset();
            toast({ title: '¡Éxito!', description: 'Supermercado añadido correctamente.' });
        } catch (error) {
            console.error("Failed to add supermarket:", error);
            toast({ title: 'Error', description: 'No se pudo añadir el supermercado.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSupermarketAction(id);
            setSupermarkets(prev => prev.filter(s => s.id !== id));
            toast({ title: 'Eliminado', description: 'Supermercado eliminado con éxito.' });
        } catch (error) {
            console.error("Failed to delete supermarket:", error);
            toast({ title: 'Error', description: 'No se pudo eliminar el supermercado.', variant: 'destructive' });
        }
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Gestionar Supermercados</CardTitle>
                <CardDescription>Añadir, ver y eliminar supermercados para el comercio por proximidad.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Form to Add Supermarket */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddSubmit)} className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><PlusCircle /> Añadir Nuevo Supermercado</h3>
                        <FormField
                            control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1"><Store size={16}/> Nombre</FormLabel>
                                <FormControl><Input placeholder="Nombre del Supermercado" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField
                            control={form.control} name="logoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1"><ImageIcon size={16}/> URL del Logo</FormLabel>
                                <FormControl><Input placeholder="https://ejemplo.com/logo.png" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="flex gap-4">
                             <FormField
                                control={form.control} name="latitude" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="flex items-center gap-1"><Globe size={16}/> Latitud</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="Ej: -0.1764"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={e => {
                                                const value = parseFloat(e.target.value);
                                                field.onChange(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField
                                control={form.control} name="longitude" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="flex items-center gap-1"><Globe size={16}/> Longitud</FormLabel>
                                    <FormControl>
                                         <Input
                                            type="number"
                                            step="any"
                                            placeholder="Ej: -78.4854"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={e => {
                                                const value = parseFloat(e.target.value);
                                                field.onChange(isNaN(value) ? 0 : value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Añadir Supermercado
                        </Button>
                    </form>
                </Form>

                {/* List of Supermarkets */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Supermercados Existentes</h3>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Logo</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Ubicación (Lat, Lon)</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supermarkets.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <Image src={s.logoUrl} alt={s.name} width={32} height={32} className="rounded-sm object-contain"/>
                                            </TableCell>
                                            <TableCell className="font-medium">{s.name}</TableCell>
                                            <TableCell className="text-xs font-mono">{s.location.latitude.toFixed(4)}, {s.location.longitude.toFixed(4)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
