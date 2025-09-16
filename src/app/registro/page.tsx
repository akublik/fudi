
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Star, Tag, Gift, Store, BookUser } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { EmailAuthCredentialsSchema, type EmailAuthCredentials } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const benefits = [
    { icon: BookUser, text: "Guarda y crea tus propias recetas" },
    { icon: Star, text: "Acumula puntos Fudi con tus compras" },
    { icon: Store, text: "Accede a nuestra futura tienda de canje" },
    { icon: Tag, text: "Recibe promociones y descuentos exclusivos" },
    { icon: Gift, text: "Obtén beneficios de nuestro programa de afiliados" },
];

const loginSchema = z.object({
    email: z.string().email("Por favor, introduce un correo válido."),
    password: z.string().min(1, "La contraseña no puede estar vacía."),
});
type LoginValues = z.infer<typeof loginSchema>;


export default function RegisterPage() {
    const router = useRouter();
    const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoginView, setIsLoginView] = useState(false);

    const registerForm = useForm<EmailAuthCredentials>({
        resolver: zodResolver(EmailAuthCredentialsSchema),
        defaultValues: { name: '', email: '', password: '' },
    });

    const loginForm = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        await signInWithGoogle();
        // The AuthProvider will handle redirection via the onAuthStateChanged listener effect
        router.push('/');
    };

    const handleEmailSignUp = async (values: EmailAuthCredentials) => {
        setIsLoading(true);
        const success = await signUpWithEmail(values);
        if (success) {
            router.push('/');
        }
        setIsLoading(false);
    };

    const handleEmailSignIn = async (values: LoginValues) => {
        setIsLoading(true);
        const success = await signInWithEmail(values);
        if (success) {
            router.push('/');
        }
        setIsLoading(false);
    };
    
    const AuthForm = () => {
        if (isLoginView) {
            return (
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleEmailSignIn)} className="space-y-4">
                        <FormField control={loginForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="tu@correo.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={loginForm.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Iniciar Sesión
                        </Button>
                    </form>
                </Form>
            );
        }

        return (
            <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleEmailSignUp)} className="space-y-4">
                    <FormField control={registerForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Tu Nombre" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={registerForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="tu@correo.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={registerForm.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Cuenta
                    </Button>
                </form>
            </Form>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
             <div className="absolute top-4 left-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Inicio
                    </Link>
                </Button>
            </div>
            <main className="container flex flex-1 items-center justify-center py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl w-full">
                    
                    {/* Columna Izquierda: Beneficios */}
                    <div className="flex flex-col justify-center text-center md:text-left">
                         <div className="flex justify-center md:justify-start">
                            <Image src="https://i.imgur.com/soZkYAE.png" alt="Fudi Chef Logo" width={100} height={100} />
                         </div>
                        <h1 className="text-3xl font-bold mt-4">Únete a la comunidad Fudi Chef</h1>
                        <p className="text-muted-foreground mt-2 mb-6">Crea tu cuenta gratuita y accede a beneficios exclusivos para llevar tu experiencia en la cocina al siguiente nivel.</p>
                        <ul className="space-y-3 text-left">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <benefit.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="font-medium text-foreground">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Columna Derecha: Formulario de Auth */}
                    <div className="flex items-center">
                        <Card className="w-full shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-2xl">{isLoginView ? 'Iniciar Sesión' : 'Crea tu Cuenta Gratuita'}</CardTitle>
                                <CardDescription>{isLoginView ? 'Ingresa tus credenciales para acceder.' : 'Solo te tomará un minuto.'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <AuthForm />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                                    <Image src="/google.svg" alt="Google logo" width={20} height={20} className="mr-2"/>
                                    Google
                                </Button>
                            </CardContent>
                            <CardFooter>
                                 <div className="text-center text-sm text-muted-foreground w-full">
                                    {isLoginView ? "¿No tienes cuenta? " : "¿Ya tienes una cuenta? "}
                                    <Button variant="link" className="p-0 h-auto" onClick={() => setIsLoginView(!isLoginView)}>
                                        {isLoginView ? "Regístrate aquí" : "Inicia sesión aquí"}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
