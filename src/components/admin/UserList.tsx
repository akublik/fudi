
"use client";

import { useState, useEffect } from 'react';
import { getRegisteredUsersAction } from '@/lib/actions';
import type { RegisteredUser } from '@/ai/flows/get-registered-users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Star } from 'lucide-react';
import { Badge } from '../ui/badge';

export function UserList() {
    const [users, setUsers] = useState<RegisteredUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const userList = await getRegisteredUsersAction();
                setUsers(userList);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, []);

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
                <CardDescription>Lista de todos los usuarios registrados en la aplicación y sus preferencias.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4 text-muted-foreground">Cargando usuarios...</p>
                    </div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Avatar</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Perfil</TableHead>
                                    <TableHead>Cocinas</TableHead>
                                    <TableHead>Restricciones</TableHead>
                                    <TableHead className="text-right">Puntos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                                                <AvatarFallback><User size={20} /></AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{user.displayName || 'N/A'}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span>{user.preferences.age ? `${user.preferences.age} años` : ''}</span>
                                                <span>{user.preferences.weight ? `${user.preferences.weight}kg` : ''}</span>
                                                <span>{user.preferences.height ? `${user.preferences.height}cm` : ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.preferences.cuisines?.map(cuisine => (
                                                    <Badge key={cuisine} variant="outline">{cuisine}</Badge>
                                                ))}
                                                {user.preferences.otherCuisines && (
                                                    <Badge variant="outline">{user.preferences.otherCuisines}</Badge>
                                                )}
                                                {(user.preferences.cuisines?.length === 0 && !user.preferences.otherCuisines) && (
                                                    <span className="text-xs text-muted-foreground">N/A</span>
                                                )}
                                            </div>
                                        </TableCell>
                                         <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.preferences.restrictions?.map(restriction => (
                                                    <Badge key={restriction} variant="secondary">{restriction}</Badge>
                                                ))}
                                                 {user.preferences.restrictions?.length === 0 && (
                                                    <span className="text-xs text-muted-foreground">N/A</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary" className="flex items-center gap-1 justify-end min-w-max">
                                                <Star size={14} className="text-yellow-500" />
                                                {user.preferences.totalPoints || 0}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
