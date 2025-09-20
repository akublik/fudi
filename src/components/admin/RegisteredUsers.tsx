
"use client";

import { useEffect, useState } from 'react';
import { getRegisteredUsers } from '@/lib/actions';
import type { RegisteredUser } from '@/ai/flows/get-registered-users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Users, Mail, ChefHat, Wheat, Globe, Star, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export function RegisteredUsers() {
    const [users, setUsers] = useState<RegisteredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedUsers = await getRegisteredUsers();
                setUsers(fetchedUsers);
            } catch (err: any) {
                console.error("Error fetching data: ", err);
                setError("No se pudieron cargar los datos de los usuarios. " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Cargando usuarios...</p>
            </div>
        );
    }
    
    if (error) {
        return (
             <Card className="w-full max-w-4xl mx-auto shadow-lg bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle />
                        Error al Cargar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-2">
                    <Users />
                    Usuarios Registrados
                </CardTitle>
                <CardDescription>
                    Lista de todos los usuarios autenticados en la aplicación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No se encontraron usuarios registrados.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {users.map(user => (
                            <Card key={user.uid} className="p-4">
                               <div className="flex flex-col sm:flex-row items-center gap-4">
                                     <Avatar className="h-16 w-16 border-2">
                                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                                        <AvatarFallback className="text-2xl"><User /></AvatarFallback>
                                    </Avatar>
                                     <div className="flex-grow text-center sm:text-left">
                                        <h3 className="text-lg font-bold">{user.displayName || 'Usuario sin nombre'}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                                            <Mail className="h-4 w-4"/>
                                            {user.email || 'No disponible'}
                                        </p>
                                         <div className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span>{user.preferences.totalPoints || 0} Puntos Fudi</span>
                                        </div>
                                    </div>
                               </div>
                               <div className="mt-4 pt-4 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-1 mb-2"><Wheat/> Restricciones</h4>
                                            {user.preferences.restrictions?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.preferences.restrictions.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}
                                                </div>
                                            ) : <p className="text-muted-foreground">Ninguna</p>}
                                        </div>
                                         <div>
                                            <h4 className="font-semibold flex items-center gap-1 mb-2"><Globe/> Cocinas Favoritas</h4>
                                            {user.preferences.cuisines?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.preferences.cuisines.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                                                </div>
                                            ) : <p className="text-muted-foreground">Ninguna</p>}
                                            {user.preferences.otherCuisines && (
                                                 <div className="mt-2">
                                                    <h5 className="font-semibold">Otras:</h5>
                                                    <p className="text-muted-foreground">{user.preferences.otherCuisines}</p>
                                                 </div>
                                            )}
                                        </div>
                                    </div>
                               </div>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
