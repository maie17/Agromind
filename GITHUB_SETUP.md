# Configuración de GitHub

## Estado Actual
✅ Repositorio Git inicializado
✅ Commit inicial realizado (13 archivos, 991 líneas)

## Próximos Pasos

### Opción 1: Repositorio Nuevo en GitHub

1. **Crear el repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre del repositorio: `fyo-ai-commercial-copilot` (o el que prefieras)
   - **NO** inicialices con README, .gitignore o licencia (ya los tenemos)
   - Haz clic en "Create repository"

2. **Conectar y subir el código:**
   ```powershell
   cd "C:\Users\mmiraglia\OneDrive - fyo.com\Desktop\Agromind"
   git remote add origin https://github.com/TU-USUARIO/NOMBRE-REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```

### Opción 2: Repositorio Existente

Si ya tienes un repositorio creado:

```powershell
cd "C:\Users\mmiraglia\OneDrive - fyo.com\Desktop\Agromind"
git remote add origin https://github.com/TU-USUARIO/NOMBRE-REPOSITORIO.git
git branch -M main
git push -u origin main
```

## Configuración de Git (Opcional)

Si quieres configurar tu nombre y email para los commits:

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

## Autenticación

GitHub ya no acepta contraseñas. Necesitarás:

1. **Personal Access Token (PAT):**
   - Ve a: https://github.com/settings/tokens
   - Genera un nuevo token con permisos `repo`
   - Úsalo como contraseña cuando Git te lo pida

2. **O usar GitHub CLI:**
   ```powershell
   winget install --id GitHub.cli
   gh auth login
   ```

## Comandos Útiles

```powershell
# Ver el estado del repositorio
git status

# Ver los remotes configurados
git remote -v

# Ver el historial de commits
git log --oneline

# Agregar cambios y hacer commit
git add .
git commit -m "Descripción del cambio"
git push
```

