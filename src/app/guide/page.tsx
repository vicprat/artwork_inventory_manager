import Link from 'next/link';
import { ArrowLeftIcon, DownloadIcon, EditIcon, PlusCircleIcon, SaveIcon, SearchIcon, TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
export default function GuidePage() {
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
                <h3 className="font-semibold mb-1">Buscar y Ordenar</h3>
                <p className="text-sm text-gray-600">
                  Usa la barra de búsqueda <SearchIcon className="inline-block h-4 w-4" /> para filtrar por título, artista, etc. También puedes hacer clic en los encabezados de las columnas para ordenar los resultados.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Acceder a la Vista Detallada</h3>
                <p className="text-sm text-gray-600">
                  Para ver y editar todos los detalles de una obra, **haz clic en su título** en la tabla. Esto te llevará a la página de edición completa de esa pieza.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Edición Rápida</h3>
                <p className="text-sm text-gray-600">
                  Para cambios rápidos, usa el ícono del lápiz <EditIcon className="inline-block h-4 w-4" /> en cualquier fila. No olvides guardar con <SaveIcon className="inline-block h-4 w-4" />.
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
                En la página de edición detallada, si un artista, técnica o localización no existe, puedes añadirlo al sistema.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Simplemente haz clic en el botón <PlusCircleIcon className="inline-block h-4 w-4" /> al lado del menú desplegable, escribe el nuevo nombre y guárdalo. Aparecerá inmediatamente en la lista para que puedas seleccionarlo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exportar a CSV para Shopify</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">
                Este es el paso final. Una vez que todo el inventario esté completo y revisado, puedes generar el archivo para Shopify.
              </p>
              <p className="text-sm text-gray-600">
                1. En la vista principal, haz clic en <Button variant="outline" size="sm" className="inline-flex h-auto py-0.5 px-1.5 align-middle pointer-events-none"><DownloadIcon className="inline-block h-3 w-3 mr-1" />Exportar a CSV</Button>.
              </p>
              <p className="text-sm text-gray-600">
                2. Aparecerá una ventana de confirmación <TriangleAlertIcon className="inline-block h-4 w-4 mx-1 text-destructive" /> para asegurar que estás listo para exportar.
              </p>
               <p className="text-sm text-gray-600">
                3. Al confirmar, se descargará un archivo <code className="font-mono text-xs bg-gray-200 p-1 rounded">shopify_export_... .csv</code> en tu computadora, listo para ser importado en tu tienda de Shopify.
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