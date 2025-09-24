
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function AIMonitor() {
    const gcpProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const vertexAIUrl = `https://console.cloud.google.com/vertex-ai/usage?project=${gcpProjectId}`;

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Monitor de Uso y Costos de IA</CardTitle>
                <CardDescription>Accede a los paneles de Google Cloud y Genkit para monitorear el rendimiento y los costos de la inteligencia artificial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2"><BarChart /> Uso y Facturación en Google Cloud</CardTitle>
                        <CardDescription>
                            El panel de Vertex AI en Google Cloud es la fuente oficial para ver el uso detallado de los modelos de IA (Gemini), los costos asociados y configurar alertas de facturación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Necesitarás tener los permisos adecuados en el proyecto de Google Cloud para ver esta sección.
                        </p>
                        {gcpProjectId ? (
                             <Button asChild>
                                <Link href={vertexAIUrl} target="_blank">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ir al panel de uso de Vertex AI
                                </Link>
                            </Button>
                        ) : (
                            <p className="text-destructive font-semibold">
                                La variable de entorno NEXT_PUBLIC_FIREBASE_PROJECT_ID no está configurada. No se puede generar el enlace.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Panel de Desarrollo de Genkit</CardTitle>
                        <CardDescription>
                            Para desarrollo y depuración local, el "Dev UI" de Genkit te permite inspeccionar los traces de cada flujo, ver las entradas y salidas, y medir el rendimiento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="mb-4 text-sm text-muted-foreground">
                            Para usarlo, ejecuta `npm run genkit:dev` en tu terminal y abre la URL que se muestra (normalmente http://localhost:4000).
                        </p>
                        <Button asChild variant="secondary">
                            <Link href="http://localhost:4000" target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Abrir Genkit Dev UI (local)
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
