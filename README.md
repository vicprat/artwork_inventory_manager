Gestor de Inventario de Obras de Arte
Artwork Inventory Manager es una aplicación web interna, construida con Next.js y Supabase, diseñada para estandarizar y enriquecer los datos de un inventario de obras de arte. El objetivo principal es preparar la información para una importación masiva y exitosa en plataformas de e-commerce como Shopify, que por defecto no soportan campos de datos específicos para el arte.

Esta herramienta centraliza la gestión de productos, permite la edición detallada de metadatos de las obras (dimensiones, técnica, localización, etc.) y automatiza la generación de tags para una mejor organización y filtrado.

🖼️ Screenshots
(Aquí puedes insertar las imágenes para mostrar la interfaz)

Vista Principal de la Tabla:
[Imagen de la vista de tabla de la aplicación]

Vista de Detalle de la Obra:
[Imagen de la página de detalle de una obra]

✨ Características Principales
Tabla de Datos Interactiva: Visualiza todo el inventario en una tabla con paginación, búsqueda global y ordenamiento por columnas.
Edición Rápida en Línea: Modifica campos clave directamente desde la tabla principal para una gestión ágil.
Página de Detalle Dedicada: Accede a una vista completa para cada obra (/artwork/[id]) con un formulario detallado y una interfaz de usuario inspirada en Shopify.
Gestión de Imágenes: Sube y actualiza la imagen principal de cada obra con carga directa a Supabase Storage.
Editor de Texto Enriquecido: Crea descripciones de productos detalladas y con formato gracias al editor Tiptap.
Gestión de Opciones Centralizada: Las opciones para campos como Artista, Técnica, Tipo y Localización se gestionan en tablas dedicadas en la base de datos, no en el código, asegurando consistencia en los datos.
Creación Dinámica de Opciones: Permite añadir nuevos artistas, técnicas, etc., directamente desde la interfaz de detalle de la obra, actualizando los menús desplegables en tiempo real.
Sistema de Tags Inteligente:
Generación Automática: Los tags se crean automáticamente a partir de campos como el artista, la técnica, las dimensiones, el año y la localización.
Tags Manuales Controlados: Añade etiquetas personalizadas a través de un dropdown de selección múltiple que se nutre de los tags manuales ya existentes, evitando la duplicación.
Interfaz de Usuario Intuitiva: Componentes claros y acciones directas, como el botón para cambiar el estatus del producto (Borrador/Activo).
🚀 Pila Tecnológica
Categoría	Tecnología
Framework	Next.js (con App Router)
Lenguaje	TypeScript
Backend y BD	Supabase (PostgreSQL, Storage)
Gestión de Estado	TanStack Query (React Query)
Tablas de Datos	TanStack Table
Estilos	Tailwind CSS
Componentes UI	shadcn/ui, con componentes personalizados
Iconos	Lucide React

Exportar a Hojas de cálculo
🔧 Instalación y Puesta en Marcha
Sigue estos pasos para ejecutar el proyecto en tu entorno local.

Prerrequisitos:

Node.js (v18 o superior)
pnpm, npm o yarn
1. Clonar el Repositorio

Bash

git clone https://github.com/tu-usuario/artwork-inventory-manager.git
cd artwork-inventory-manager
2. Instalar Dependencias

Bash

pnpm install
# o
npm install
# o
yarn install
3. Configurar Variables de Entorno
Crea un archivo llamado .env.local en la raíz del proyecto.

Fragmento de código

# .env.local
NEXT_PUBLIC_SUPABASE_URL="TU_PROJECT_URL_DE_SUPABASE"
NEXT_PUBLIC_SUPABASE_ANON_KEY="TU_ANON_KEY_DE_SUPABASE"
Puedes encontrar estas claves en tu panel de Supabase, en la sección Project Settings > API.

4. Configuración de la Base de Datos
El proyecto requiere una estructura de base de datos específica en Supabase.

Tablas Principales
Estas tablas almacenan la información del inventario. Ejecuta el siguiente SQL en el SQL Editor de Supabase.

SQL

-- Tabla para los productos/obras de arte
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  body_html TEXT,
  vendor TEXT, -- Artista
  type TEXT,   -- Tipo de obra (Pintura, Escultura)
  tags TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- 'ACTIVE' o 'DRAFT'
  variantPrice NUMERIC NOT NULL,
  -- Campos específicos para obras de arte
  artwork_medium TEXT,
  artwork_height TEXT,
  artwork_width TEXT,
  profundidad TEXT,
  artwork_year TEXT,
  artworkLocation TEXT,
  serie TEXT,
  -- Otros campos relevantes
  sourceType TEXT NOT NULL, -- 'SHOPIFY', 'WOOCOMMERCE', 'MANUAL'
  source_id TEXT
);

-- Tabla para las imágenes de los productos
CREATE TABLE public.product_images (
  id TEXT PRIMARY KEY,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  supabase_url TEXT NOT NULL,
  supabase_path TEXT,
  position INTEGER NOT NULL
);
Tablas de Opciones
Estas tablas gestionan las opciones de los menús desplegables para mantener la consistencia de los datos.

SQL

-- Crear las tablas para las opciones dinámicas
CREATE TABLE public.artists (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.techniques (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.artwork_types (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.locations (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE public.materials (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Habilitar RLS y crear políticas de acceso público
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for artists" ON public.artists FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.techniques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for techniques" ON public.techniques FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.artwork_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for artwork_types" ON public.artwork_types FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access for materials" ON public.materials FOR ALL USING (true) WITH CHECK (true);
Función RPC para Tags
Para que el dropdown de tags manuales funcione, crea esta función en Database > Functions en Supabase.

SQL

CREATE OR REPLACE FUNCTION get_unique_tags()
RETURNS TABLE(tag TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT trim(t.tag_name)
    FROM public.products, unnest(string_to_array(public.products.tags, ',')) AS t(tag_name)
    WHERE public.products.tags IS NOT NULL AND trim(t.tag_name) <> ''
    ORDER BY trim(t.tag_name);
END;
$$ LANGUAGE plpgsql;
5. Ejecutar el Servidor de Desarrollo

Bash

pnpm dev
# o
npm run dev
Abre http://localhost:3000 en tu navegador para ver la aplicación.

🏛️ Arquitectura y Conceptos Clave
Server Components y Client Components: La aplicación aprovecha el App Router de Next.js. Las páginas iniciales (page.tsx) son Server Components (export const dynamic = 'force-dynamic'), mientras que los componentes interactivos (la tabla, los formularios) son Client Components ('use client').
Gestión de Datos con TanStack Query: Todas las operaciones (lectura y escritura) se manejan a través de useQuery y useMutation. Esto proporciona caching, revalidación automática y una experiencia de usuario optimista.
Gestión Dinámica de Opciones: La aplicación utiliza un patrón de useQuery para obtener las listas de opciones (artistas, técnicas, etc.) desde una API dedicada (/api/options/[name]). Esto permite que las opciones de los menús desplegables se actualicen en tiempo real si se añade un nuevo valor a la base de datos.
Normalización de Tags: Para evitar inconsistencias, el sistema utiliza una función que elimina acentos y convierte el texto a minúsculas antes de comparar. Esto asegura que tags como "Óleo" y "oleo" se traten como uno solo.
🚧 Próximos Pasos
Exportación a CSV: Implementar una funcionalidad para exportar todos los datos del inventario a un archivo CSV compatible con el formato de importación de productos de Shopify.
🚀 Despliegue
La forma más sencilla de desplegar este proyecto es a través de Vercel, la plataforma de los creadores de Next.js. Simplemente conecta tu repositorio de GitHub, configura las variables de entorno y Vercel se encargará del resto.