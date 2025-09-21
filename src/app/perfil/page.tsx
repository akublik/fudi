
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useUserPreferences, } from '@/hooks/use-user-preferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, ChefHat, Wheat, Globe, Save, Star, Dumbbell, Ruler, Cake, Weight } from 'lucide-react';
import { Footer } from '@/components/common/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPreferencesSchema, type UserPreferences } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { PurchaseHistory } from '@/components/perfil/PurchaseHistory';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const restrictionsList = [
    { id: 'vegetariano', label: 'Vegetariano' },
    { id: 'vegano', label: 'Vegano' },
    { id: 'sin-gluten', label: 'Sin Gluten' },
    { id: 'sin-lactosa', label: 'Sin Lactosa' },
    { id: 'alergia-nueces', label: 'Alergia a Nueces' },
    { id: 'alergia-mariscos', label: 'Alergia a Mariscos' },
    { id: 'bajo-en-carbohidratos', label: 'Bajo en Carbohidratos' },
    { id: 'bajo-en-grasa', label: 'Bajo en Grasa' },
] as const;

const cuisineList = [
    { id: 'italiana', label: 'Italiana' },
    { id: 'mexicana', label: 'Mexicana' },
    { id: 'asiatica', label: 'Asiática (China, Japonesa, Thai)' },
    { id: 'mediterranea', label: 'Mediterránea' },
    { id: 'espanola', label: 'Española' },
    { id: 'india', label: 'India' },
    { id: 'americana', label: 'Americana' },
    { id: 'francesa', label: 'Francesa' },
    { id: 'peruana', label: 'Peruana' },
    { id: 'colombiana', label: 'Colombiana' },
    { id: 'ecuatoriana', label: 'Ecuatoriana' },
] as const;


export default function ProfilePage() {
    const { user, loading } = useAuth();
    const { preferences, savePreferences, isLoaded } = useUserPreferences();
    const { toast } = useToast();

    const form = useForm<UserPreferences>({
        resolver: zodResolver(UserPreferencesSchema),
        defaultValues: {
            restrictions: [],
            cuisines: [],
            otherCuisines: '',
            totalPoints: 0,
            gender: 'masculino',
            activityLevel: 'sedentario',
        }
    });
    
    useEffect(() => {
        if (isLoaded && preferences) {
            form.reset(preferences);
        }
    }, [isLoaded, preferences, form]);

    const onSubmit = (data: UserPreferences) => {
        // Ensure numeric values are numbers, not strings from the form
        const numericData: UserPreferences = {
            ...data,
            age: data.age ? Number(data.age) : undefined,
            weight: data.weight ? Number(data.weight) : undefined,
            height: data.height ? Number(data.height) : undefined,
        }
        savePreferences(numericData);
        toast({
            title: '¡Preferencias Guardadas!',
            description: 'Tus preferencias de cocina han sido actualizadas.',
        });
    };

    if (loading || !isLoaded) {
        return <div className="flex justify-center items-center h-screen">Cargando perfil...</div>;
    }

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center">
                <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
                <p className="mb-6">Debes iniciar sesión para ver tu perfil.</p>
                <Button asChild>
                    <Link href="/">Volver al Inicio</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen">
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Button asChild variant="outline" className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Inicio
                    </Link>
                </Button>

                <Card className="w-full max-w-4xl mx-auto shadow-lg">
                    <CardHeader className="bg-muted/30 p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-background">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
                                <AvatarFallback className="text-4xl"><User /></AvatarFallback>
                            </Avatar>
                            <div className="text-center sm:text-left flex-grow">
                                <CardTitle className="font-headline text-3xl">{user.displayName}</CardTitle>
                                <CardDescription className="flex items-center gap-2 justify-center sm:justify-start mt-2">
                                    <Mail className="h-4 w-4"/> {user.email}
                                </CardDescription>
                            </div>
                             <Card className="p-4 bg-background shadow-inner">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                                        <span className="text-4xl font-bold text-foreground">{preferences.totalPoints || 0}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">Puntos Fudi</p>
                                </div>
                            </Card>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><User className="text-primary"/> Perfil Nutricional</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Género</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="masculino">Masculino</SelectItem>
                                                    <SelectItem value="femenino">Femenino</SelectItem>
                                                </SelectContent>
                                                </Select>
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="age"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1"><Cake size={16}/> Edad</FormLabel>
                                                <FormControl>
                                                <Input type="number" placeholder="Ej: 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)} />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="weight"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1"><Weight size={16}/> Peso (kg)</FormLabel>
                                                <FormControl>
                                                <Input type="number" step="0.1" placeholder="Ej: 70" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="height"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1"><Ruler size={16}/> Altura (cm)</FormLabel>
                                                <FormControl>
                                                <Input type="number" placeholder="Ej: 175" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)} />
                                                </FormControl>
                                            </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="activityLevel"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1"><Dumbbell size={16}/> Nivel de Actividad</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Selecciona tu nivel" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="sedentario">Sedentario (poco o nada)</SelectItem>
                                                    <SelectItem value="ligero">Ligero (1-3 días/semana)</SelectItem>
                                                    <SelectItem value="moderado">Moderado (3-5 días/semana)</SelectItem>
                                                    <SelectItem value="activo">Activo (6-7 días/semana)</SelectItem>
                                                    <SelectItem value="muy-activo">Muy Activo (trabajo físico)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />
                                
                                <FormField
                                    control={form.control}
                                    name="restrictions"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-xl font-semibold flex items-center gap-2"><Wheat className="text-primary"/> Mis Restricciones y Alergias</FormLabel>
                                                <FormDescription>Selecciona las opciones que apliquen a tu dieta.</FormDescription>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {restrictionsList.map((item) => (
                                                    <FormField
                                                        key={item.id}
                                                        control={form.control}
                                                        name="restrictions"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), item.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="cuisines"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-xl font-semibold flex items-center gap-2"><Globe className="text-primary"/> Mis Cocinas Favoritas</FormLabel>
                                                    <FormDescription>Dinos qué tipos de comida te encantan.</FormDescription>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {cuisineList.map((item) => (
                                                        <FormField
                                                            key={item.id}
                                                            control={form.control}
                                                            name="cuisines"
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(item.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...(field.value || []), item.id])
                                                                                    : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="otherCuisines"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Otras cocinas que te gusten</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: Tailandesa, Griega, Libanesa" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Escribe otros tipos de cocina separados por comas.
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" size="lg" className="shadow-md hover:shadow-lg hover:scale-105 transition-all w-full sm:w-auto">
                                    <Save className="mr-2 h-5 w-5" />
                                    Guardar Mis Preferencias
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                
                <PurchaseHistory />

            </main>
            <Footer />
        </div>
    );
}
