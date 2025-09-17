
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="outline" className="mb-8">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Link>
        </Button>
      <h1 className="text-4xl font-bold mb-6 font-headline">Política de Privacidad de Fudi Chef</h1>
      <div className="space-y-6 text-muted-foreground">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          Bienvenido a Fudi Chef ("nosotros", "nuestro"). Tu privacidad es de suma importancia para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información cuando utilizas nuestra aplicación web.
        </p>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">1. Información que Recopilamos</h2>
          <p>Podemos recopilar información sobre ti de varias maneras:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              <strong>Información Personal Identificable:</strong> Cuando te registras a través de Google o correo electrónico, recopilamos tu nombre, dirección de correo electrónico y foto de perfil, tal como la proporciona el servicio de autenticación (Firebase Authentication).
            </li>
            <li>
              <strong>Preferencias de Usuario:</strong> Almacenamos tus preferencias de cocina, como restricciones dietéticas y cocinas favoritas, para personalizar tu experiencia. Estos datos se asocian a tu cuenta de usuario si has iniciado sesión.
            </li>
            <li>
              <strong>Contenido Generado por el Usuario:</strong> Si creas tus propias recetas, guardas recetas favoritas o creas planes de menú, esta información se almacena. Las recetas creadas por ti se asocian con el nombre de autor que proporciones.
            </li>
             <li>
              <strong>Datos de Uso Local:</strong> Las recetas generadas, tus recetas favoritas, la lista de compras y tu información de contacto para compartir se guardan localmente en tu navegador (`localStorage`) para mejorar tu experiencia y permitir la persistencia de datos entre sesiones. Estos datos no se envían a nuestros servidores a menos que inicies una acción específica (ej. guardar una preferencia en tu perfil).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">2. Cómo Usamos tu Información</h2>
          <p>Usamos la información que recopilamos para:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Crear y gestionar tu cuenta.</li>
            <li>Proporcionar una experiencia personalizada, sugiriendo recetas y planes basados en tus preferencias.</li>
            <li>Permitirte guardar, crear y gestionar tus recetas y listas de compras.</li>
            <li>Operar, mantener y mejorar nuestra aplicación.</li>
            <li>Procesar transacciones simuladas y otorgar puntos de fidelidad "Puntos Fudi".</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">3. Cómo Compartimos tu Información</h2>
          <p>No vendemos ni alquilamos tu información personal a terceros. Podemos compartir información en las siguientes situaciones:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              <strong>Con Proveedores de Servicios:</strong> Utilizamos servicios de terceros como Google Firebase para la autenticación, base de datos (Firestore) y hosting. Estos proveedores tienen acceso a tu información solo para realizar estas tareas en nuestro nombre y están obligados a no divulgarla ni utilizarla para ningún otro propósito.
            </li>
            <li>
              <strong>Para Cumplir con la Ley:</strong> Podemos divulgar tu información si así lo exige la ley para cumplir con una citación, un proceso legal similar o una solicitud gubernamental.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">4. Seguridad de tu Información</h2>
          <p>
            Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger tu información personal. Si bien hemos tomado medidas razonables para proteger la información personal que nos proporcionas, ten en cuenta que ningún sistema de seguridad es perfecto o impenetrable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">5. Tus Derechos y Opciones</h2>
          <p>
            Tienes derecho a acceder, corregir o eliminar tu información personal. Puedes actualizar tus preferencias directamente en la sección "Mi Perfil" de la aplicación. Para eliminar tu cuenta y los datos asociados, por favor contáctanos a través del correo electrónico proporcionado a continuación.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">6. Cambios a esta Política de Privacidad</h2>
          <p>
            Nos reservamos el derecho de realizar cambios a esta Política de Privacidad en cualquier momento. Te notificaremos sobre cualquier cambio publicando la nueva Política de Privacidad en esta página con una nueva fecha de "última actualización".
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">7. Contáctanos</h2>
          <p>
            Si tienes preguntas o comentarios sobre esta Política de Privacidad, por favor contáctanos en: <a href="mailto:info@fudichef.com" className="text-primary underline">info@fudichef.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
