
"use client";

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import type { PurchaseHistoryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { History, Link as LinkIcon, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import Link from 'next/link';

export function PurchaseHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<PurchaseHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const q = query(
                    collection(db, "purchaseHistory"),
                    where("userId", "==", user.uid),
                    orderBy("purchaseDate", "desc")
                );
                const querySnapshot = await getDocs(q);
                const historyData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as PurchaseHistoryItem[];
                setHistory(historyData);
            } catch (error) {
                console.error("Error fetching purchase history: ", error);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <Card className="w-full shadow-lg mt-8">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2"><ShoppingBag /> Historial de Compras</CardTitle>
                    <CardDescription>Cargando tu historial...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        <History className="mx-auto h-12 w-12 mb-4 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (history.length === 0) {
        return (
            <Card className="w-full shadow-lg mt-8">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2"><ShoppingBag /> Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        <History className="mx-auto h-12 w-12 mb-4" />
                        <p>Aún no tienes compras en tu historial.</p>
                        <p className="text-sm">Cuando envíes una lista a un supermercado, aparecerá aquí.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Fecha no disponible';
        // Firestore Timestamps have a toDate() method.
        if (timestamp.toDate) {
            return timestamp.toDate().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        // Fallback for already converted dates or strings
        try {
             return new Date(timestamp).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    }
    
     const formatCurrency = (amount?: number) => {
        if (typeof amount !== 'number') return '$ --';
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }


    return (
        <Card className="w-full shadow-lg mt-8">
            <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-2"><ShoppingBag /> Historial de Compras</CardTitle>
                <CardDescription>Aquí puedes ver un registro de tus compras simuladas y los puntos ganados.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {history.map(purchase => (
                        <AccordionItem value={purchase.id} key={purchase.id} className="border rounded-lg">
                           <AccordionTrigger className="px-4 hover:no-underline">
                                <div className="flex justify-between items-center w-full pr-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                                        <span className="font-semibold text-lg">{formatDate(purchase.purchaseDate)}</span>
                                        <Badge variant="secondary">{purchase.store}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold hidden md:block">
                                            {formatCurrency(purchase.totalCost)}
                                        </span>
                                        <Badge variant="default" className="flex items-center gap-1">
                                            <Star size={14} /> {purchase.pointsEarned || 0} Puntos
                                        </Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4">
                               <div className="flex justify-between items-center mb-2 text-sm">
                                    <p>
                                        <Link href={purchase.checkoutUrl} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                            <LinkIcon size={14}/> Ver Carrito Simulado
                                        </Link>
                                    </p>
                                     <span className="text-muted-foreground font-mono">
                                        ID: {purchase.trackingId}
                                    </span>
                               </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead className="text-right">Precio</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchase.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                            </TableRow>
                                        ))}
                                         <TableRow className="font-bold bg-muted/50">
                                            <TableCell colSpan={2}>Total</TableCell>
                                            <TableCell className="text-right">{formatCurrency(purchase.totalCost)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
