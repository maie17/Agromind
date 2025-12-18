# Guía de Instalación - Copiloto Comercial fyo

## 📋 Resumen de la Arquitectura

Esta es una aplicación **React + TypeScript + Vite** que utiliza **Google Gemini AI** para analizar reuniones comerciales en el sector agropecuario argentino.

### Stack Tecnológico:
- **Frontend**: React 19.2.3 con TypeScript
- **Build Tool**: Vite 6.2.0
- **IA**: Google Gemini AI (@google/genai 1.34.0)
- **Estilos**: Tailwind CSS (via CDN)
- **Almacenamiento**: LocalStorage para historial

### Estructura del Proyecto:
```
Agromind/
├── App.tsx              # Componente principal de la aplicación
├── index.tsx            # Punto de entrada de React
├── index.html           # HTML base con Tailwind CDN
├── types.ts             # Definiciones de tipos TypeScript
├── constants.tsx        # Constantes y configuración del sistema
├── geminiService.ts     # Servicio de integración con Gemini AI
├── vite.config.ts       # Configuración de Vite
├── tsconfig.json        # Configuración de TypeScript
├── package.json         # Dependencias del proyecto
└── .env.local           # Variables de entorno (crear)
```

## 🚀 Requisitos Previos

### 1. Instalar Node.js

**Node.js no está instalado en tu sistema.** Debes instalarlo primero:

1. **Descargar Node.js:**
   - Visita: https://nodejs.org/
   - Descarga la versión **LTS (Long Term Support)** recomendada (v20.x o superior)
   - Ejecuta el instalador y sigue las instrucciones

2. **Verificar instalación:**
   ```powershell
   node --version
   npm --version
   ```

   Deberías ver las versiones instaladas (ej: v20.11.0 y 10.2.4)

## 📦 Instalación de Dependencias

Una vez que Node.js esté instalado, ejecuta en PowerShell desde la carpeta del proyecto:

```powershell
cd "C:\Users\mmiraglia\OneDrive - fyo.com\Desktop\Agromind"
npm install
```

Esto instalará todas las dependencias necesarias:
- **react** y **react-dom** (v19.2.3)
- **@google/genai** (v1.34.0) - SDK de Google Gemini AI
- **vite** - Build tool y dev server
- **typescript** - Compilador TypeScript
- **@vitejs/plugin-react** - Plugin de React para Vite
- **@types/react** y **@types/react-dom** - Tipos TypeScript para React
- **@types/node** - Tipos TypeScript para Node.js

## 🔑 Configuración de API Key

1. **Obtener API Key de Gemini:**
   - Visita: https://aistudio.google.com/app/apikey
   - Inicia sesión con tu cuenta de Google
   - Crea una nueva API key

2. **Configurar en el proyecto:**
   - Abre el archivo `.env.local` en la raíz del proyecto
   - Reemplaza `tu_api_key_aqui` con tu API key real:
   ```
   GEMINI_API_KEY=tu_api_key_real_aqui
   ```

   ⚠️ **IMPORTANTE**: No compartas tu API key públicamente. El archivo `.env.local` ya está en `.gitignore` (si usas Git).

## ▶️ Ejecutar la Aplicación

### Modo Desarrollo:
```powershell
npm run dev
```

La aplicación se abrirá en: **http://localhost:3000**

### Compilar para Producción:
```powershell
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

### Previsualizar Build de Producción:
```powershell
npm run preview
```

## 🎯 Funcionalidades Principales

1. **Grabación de Audio**: Captura reuniones comerciales usando el micrófono del navegador
2. **Análisis con IA**: Utiliza Gemini AI para analizar el contenido y detectar oportunidades
3. **Detección de Oportunidades**: Identifica oportunidades en:
   - Comercialización de granos
   - Financiación
   - Insumos
   - Servicios digitales
   - Gestión de riesgo/cobertura
4. **Historial**: Almacena análisis previos en LocalStorage
5. **Modo Demo**: Permite probar con una transcripción de ejemplo

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza el build de producción

## 📝 Notas Técnicas

- **Puerto**: La aplicación corre en el puerto 3000 por defecto (configurado en `vite.config.ts`)
- **Variables de Entorno**: Vite carga automáticamente variables de `.env.local`
- **Almacenamiento**: El historial se guarda en `localStorage` del navegador
- **Formato de Audio**: La aplicación graba en formato `audio/webm`

## ⚠️ Solución de Problemas

### Error: "node no se reconoce como comando"
- **Solución**: Instala Node.js desde https://nodejs.org/

### Error: "GEMINI_API_KEY is not defined"
- **Solución**: Verifica que el archivo `.env.local` existe y contiene tu API key

### Error: "Cannot find module '@google/genai'"
- **Solución**: Ejecuta `npm install` para instalar las dependencias

### Error de permisos de micrófono
- **Solución**: Asegúrate de permitir el acceso al micrófono en tu navegador

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Gemini AI](https://ai.google.dev/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/)

