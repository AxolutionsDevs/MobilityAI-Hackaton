# Dashboard PHI - Metro CDMX

Sistema de Análisis con NLP para transporte público con importador de líneas SVG.

## 🚀 Estructura del Proyecto

```
Hackathon/
├── app/
│   ├── layout.tsx          # Layout principal de Next.js
│   ├── page.tsx            # Página principal del dashboard
│   └── globals.css         # Estilos globales con Tailwind
├── components/
│   ├── ui/
│   │   ├── CommentCard.tsx    # Tarjeta para comentarios con sentimiento
│   │   ├── PHIGauge.tsx       # Gauge circular para PHI
│   │   └── KPICard.tsx        # Tarjeta de KPI reutilizable
│   ├── sections/
│   │   ├── Header.tsx         # Header del dashboard
│   │   ├── GlobalPHI.tsx      # Componente PHI global
│   │   ├── StationInfo.tsx    # Información de estación
│   │   ├── LiveFeed.tsx       # Feed de comentarios en vivo
│   │   └── CategoryWeights.tsx # Pesos de categorías NLP
│   └── SVGImporter.tsx     # Importador de líneas SVG (componente principal)
├── lib/
│   ├── constants.ts        # Constantes: CATEGORIES, METRO_LINES, etc.
│   └── utils.ts           # Funciones utilitarias
├── types/
│   └── index.ts           # Definiciones de tipos TypeScript
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## 📦 Componentes Principales

### 1. **UI Components** (`components/ui/`)

#### CommentCard

Muestra comentarios con indicador de sentimiento (positivo/neutral/negativo).

```tsx
<CommentCard comment={{ text: "Excelente servicio", sentiment: "positive" }} />
```

#### PHIGauge

Gauge semicircular con gradiente que muestra el índice PHI.

```tsx
<PHIGauge value={75} size={160} label="Sistema" />
```

#### KPICard

Tarjeta reutilizable para mostrar KPIs.

```tsx
<KPICard data={{ icon: Globe, label: "PHI Global", value: 75, sub: "+2.3%" }} />
```

### 2. **Section Components** (`components/sections/`)

#### Header

Header principal con título y botones de acción.

#### GlobalPHI

Muestra el PHI global del sistema con desglose por sentimiento.

#### StationInfo

Información detallada de una estación seleccionada con palabra clave predominante.

#### LiveFeed

Feed en tiempo real de comentarios con sentimiento.

#### CategoryWeights

Visualización de los pesos de categorías NLP.

### 3. **SVGImporter** (Componente Principal)

Importador completo de líneas de transporte desde archivos SVG con las siguientes características:

- ✅ Upload de archivos SVG
- ✅ Detección automática de nodos (estaciones)
- ✅ Click para agregar estaciones manualmente
- ✅ Edición de nombres de estaciones
- ✅ Asignación automática de PHI
- ✅ Visualización en tiempo real
- ✅ Exportación como JSON
- ✅ Guardado en el dashboard

**Props:**

```tsx
interface SVGImporterProps {
  onSave: (lineData: CustomLine) => void;
}
```

## 🎨 Tipos y Constantes

### Tipos Principales (`types/index.ts`)

```typescript
interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface StationData {
  phi: number;
  comments: number;
  palabraClave: string;
  categoria: string;
  // ... más campos
}

interface CustomLine {
  id: string;
  name: string;
  color: string;
  stations: Station[];
}
```

### Constantes (`lib/constants.ts`)

- **CATEGORIES**: 7 categorías NLP con pesos

  - Seguridad (30%)
  - Puntualidad (25%)
  - Limpieza (15%)
  - Comodidad (10%)
  - Comunicación (10%)
  - Fallas Técnicas (5%)
  - Saturación (5%)

- **METRO_LINES**: Líneas 1, 2 y 3 del Metro CDMX con coordenadas

- **PALABRAS_CLAVE**: Palabras clave por categoría para NLP

- **FRASES_EJEMPLO**: Ejemplos de comentarios por palabra clave

## 🛠️ Funciones Utilitarias (`lib/utils.ts`)

### generateStationPHI()

Genera datos simulados de PHI para todas las estaciones.

```typescript
const stationData = generateStationPHI();
```

### calculateGlobalPHI()

Calcula el PHI global promediando todas las estaciones.

```typescript
const globalPHI = calculateGlobalPHI(stationData);
```

## 🚦 Instalación y Uso

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 3. Build para Producción

```bash
npm run build
npm start
```

## 🎯 Características Principales

### Importador de Líneas SVG

1. **Upload de SVG**: Arrastra o selecciona un archivo SVG
2. **Detección Automática**: El sistema detecta automáticamente los nodos (círculos) como estaciones
3. **Edición Manual**:
   - Click en el canvas para agregar estaciones
   - Click en nombre para editar
   - Botón X para eliminar
4. **Configuración**:
   - Nombre de la línea personalizable
   - Color personalizable (picker + hex)
5. **Exportación**:
   - Guardar en dashboard
   - Exportar como archivo JSON

### Dashboard Analytics

- **KPIs Globales**: PHI, Comentarios Positivos, Alertas, Tiempo de Respuesta
- **PHI Global**: Gauge con desglose por sentimiento
- **Feed en Vivo**: Comentarios en tiempo real con análisis de sentimiento
- **Pesos NLP**: Visualización de categorías con barras de progreso

## 🎨 Diseño

- **Tema**: Dark mode con gradientes púrpura y slate
- **Framework CSS**: Tailwind CSS
- **Iconos**: Lucide React
- **Gráficos**: Recharts (preparado para uso)

## 📊 Flujo de Trabajo

```
1. Usuario sube SVG
   ↓
2. Sistema parsea SVG y detecta nodos
   ↓
3. Usuario edita nombres y añade/elimina estaciones
   ↓
4. Sistema asigna PHI automáticamente
   ↓
5. Usuario guarda línea o exporta JSON
   ↓
6. Línea aparece en "Líneas Importadas"
```

## 🌍 Funciona Globalmente

El sistema está diseñado para funcionar con **cualquier sistema de transporte** de **cualquier ciudad del mundo**. Solo necesitas:

1. Un archivo SVG con el trazo de la línea
2. Círculos/nodos para las estaciones (opcional, se pueden agregar manualmente)

## 🔧 Tecnologías

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (iconos)
- **Recharts** (gráficos)

## 📝 Notas de Desarrollo

- Todos los componentes usan **'use client'** donde es necesario
- TypeScript estricto activado
- Componentes modulares y reutilizables
- Props tipadas con interfaces
- Código documentado y organizado

## 🚀 Próximas Mejoras

- [ ] Integración con API real para comentarios
- [ ] Análisis NLP real con modelos de ML
- [ ] Mapas interactivos con Mapbox/Leaflet
- [ ] Sistema de alertas en tiempo real
- [ ] Dashboard de administración
- [ ] Autenticación y roles de usuario
- [ ] Exportación de reportes PDF

## 📄 Licencia

MIT License - Dashboard PHI Metro CDMX

---

**Desarrollado para el Hackathon 2025** 🚇
