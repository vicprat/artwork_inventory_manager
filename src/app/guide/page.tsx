import Link from 'next/link';
import { ArrowLeftIcon, EditIcon, PlusCircleIcon, SearchIcon, SaveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Guía de Uso</h1>
            <p className="text-gray-600 mt-1">Cómo utilizar el Gestor de Inventario de Obras de Arte.</p>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Introducción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Esta herramienta fue diseñada para ayudarte a organizar, estandarizar y enriquecer la información de tu inventario de arte. El objetivo final es tener todos los datos listos y consistentes para poder exportarlos en un formato CSV compatible e importarlos masivamente en Shopify.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista Principal (La Tabla)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Buscar y Filtrar</h3>
                <p className="text-sm text-gray-600">
                  Usa la barra de búsqueda <SearchIcon className="inline-block h-4 w-4 mx-1" /> para filtrar rápidamente la tabla. Puedes buscar por título, artista, técnica o serie.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Ordenar Columnas</h3>
                <p className="text-sm text-gray-600">
                  Haz clic en el encabezado de una columna (como &quot;Título / Artista&quot; o &quot;Año&quot;) para ordenar los resultados de forma ascendente o descendente.
                </p>
              </div>
               <div>
                <h3 className="font-semibold mb-1">Paginación</h3>
                <p className="text-sm text-gray-600">
                  En la parte inferior de la tabla, puedes navegar entre las páginas, cambiar cuántos elementos ves por página o ir directamente a una página específica.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edición de Obras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Edición Rápida</h3>
                <p className="text-sm text-gray-600">
                  Haz clic en el ícono del lápiz <EditIcon className="inline-block h-4 w-4 mx-1" /> en cualquier fila para activar la edición en línea. Después de hacer cambios, guarda con el ícono <SaveIcon className="inline-block h-4 w-4 mx-1" /> o cancela con la &apos;✕&apos;.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Edición Detallada</h3>
                <p className="text-sm text-gray-600">
                  Para editar todos los campos de una obra, haz clic en su <span className="font-bold">título</span>. Esto te llevará a una página dedicada con todas las opciones disponibles.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Añadir Nuevas Opciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                En la página de edición detallada, si un artista, técnica o localización no existe en la lista, puedes añadirlo fácilmente.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Simplemente haz clic en el botón <PlusCircleIcon className="inline-block h-4 w-4 mx-1" /> al lado del menú desplegable, escribe el nuevo nombre y guárdalo. Aparecerá inmediatamente en la lista para que puedas seleccionarlo.
              </p>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Sistema de Tags Explicado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Tags Autogenerados</h3>
                   <p className="text-sm text-gray-600">
                    El sistema crea automáticamente etiquetas basadas en los datos que ingresas. Estos tags no se pueden editar directamente, pero se actualizan solos si cambias la información de la obra.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">Artista</Badge>
                    <Badge variant="outline">Tipo de Obra</Badge>
                    <Badge variant="outline">Año</Badge>
                    <Badge variant="outline">Formato (Dimensiones)</Badge>
                    <Badge variant="outline">Materiales (de la técnica)</Badge>
                    <Badge variant="outline">Localización</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Tags Manuales</h3>
                   <p className="text-sm text-gray-600">
                    Son etiquetas adicionales que puedes añadir para clasificar la obra de forma más específica (ej: &quot;Abstracto&quot;, &quot;Exposición 2024&quot;). Usa el selector de tags para añadir etiquetas que ya existen o crear nuevas. Esto ayuda a mantener la consistencia.
                  </p>
                </div>
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}