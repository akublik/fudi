
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
       <Button asChild variant="outline" className="mb-8">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Link>
        </Button>
      <h1 className="text-4xl font-bold mb-6 font-headline">Términos y Condiciones de Uso</h1>
      <div className="space-y-6 text-muted-foreground">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          Estos Términos y Condiciones ("Términos") rigen tu acceso y uso de la aplicación web Fudi Chef ("la Aplicación", "el Servicio"), operada por Fudi Chef ("nosotros", "nuestro"). Al acceder o utilizar el Servicio, aceptas estar sujeto a estos Términos.
        </p>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">1. Cuentas de Usuario</h2>
          <p>
            Para acceder a ciertas funciones de la Aplicación, como guardar recetas o preferencias, debes crear una cuenta. Eres responsable de salvaguardar la contraseña que utilizas para acceder al Servicio y de cualquier actividad o acción bajo tu contraseña. Aceptas notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">2. Contenido y Propiedad Intelectual</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              <strong>Contenido del Servicio:</strong> Todo el contenido proporcionado por Fudi Chef, incluyendo textos, gráficos, logos, recetas generadas por IA, y software, es propiedad de Fudi Chef o se utiliza con permiso y está protegido por derechos de autor y otras leyes de propiedad intelectual.
            </li>
            <li>
              <strong>Contenido del Usuario:</strong> Si creas y envías una receta ("Contenido del Usuario"), conservas la propiedad de la misma. Sin embargo, al enviarla, nos otorgas una licencia mundial, no exclusiva, libre de regalías para usar, reproducir, modificar y mostrar dicho contenido en conexión con el Servicio.
            </li>
             <li>
              <strong>Uso Aceptable:</strong> No puedes utilizar el contenido generado por la IA (recetas, imágenes, planes) para fines comerciales sin nuestro consentimiento explícito por escrito. El uso del Servicio es para fines personales y no comerciales.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">3. Naturaleza del Contenido Generado por IA</h2>
          <p>
            Fudi Chef utiliza inteligencia artificial para generar recetas, imágenes, planes de menú e información nutricional. Reconoces que:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              El contenido generado es una sugerencia y debe ser utilizado como una guía. No garantizamos su exactitud, idoneidad o seguridad.
            </li>
            <li>
              La información nutricional es una estimación y no debe ser considerada como un consejo médico. Consulta a un profesional de la salud para tus necesidades dietéticas específicas.
            </li>
            <li>
              Debes usar tu propio juicio y seguir prácticas seguras de manejo de alimentos al preparar cualquier receta sugerida por la Aplicación. Fudi Chef no se hace responsable de los resultados de las preparaciones culinarias.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">4. Programa de Puntos Fudi y Afiliados</h2>
          <p>
            El sistema de "Puntos Fudi" y las funcionalidades de "Compra en Supermercado" son actualmente una simulación con fines de demostración. Los puntos acumulados no tienen valor monetario real y no pueden ser canjeados por bienes o servicios hasta que se anuncie oficialmente la funcionalidad completa de la tienda y el programa de afiliados.
          </p>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">5. Limitación de Responsabilidad</h2>
          <p>
            El Servicio se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD". En la máxima medida permitida por la ley aplicable, Fudi Chef renuncia a toda garantía, expresa o implícita. No seremos responsables de ningún daño indirecto, incidental, especial, consecuente o punitivo resultante de tu acceso o uso del Servicio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">6. Terminación</h2>
          <p>
            Podemos suspender o terminar tu acceso al Servicio de inmediato, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumples los Términos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">7. Cambios a los Términos</h2>
          <p>
            Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días de antelación antes de que los nuevos términos entren en vigor.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">8. Contáctanos</h2>
          <p>
            Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en: <a href="mailto:info@fudichef.com" className="text-primary underline">info@fudichef.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
