# ============================================
# SCRIPT DE VERIFICACIÓN - NorthPadel Mobile
# ============================================
# Este script verifica que la reorganización se completó correctamente
#
# IMPORTANTE: 
# - Ejecutar DESPUÉS de reorganize-structure.ps1 y update-imports.ps1
# - Ejecutar desde la raíz del proyecto mobile/
#
# USO: .\verify-structure.ps1
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE ESTRUCTURA" -ForegroundColor Cyan
Write-Host "  Proyecto: NorthPadel Mobile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "src")) {
    Write-Host "❌ ERROR: Debes ejecutar este script desde la carpeta mobile/" -ForegroundColor Red
    exit 1
}

# Contadores
$errores = 0
$advertencias = 0
$exitos = 0

# ============================================
# VERIFICACIÓN 1: Carpetas que deben existir
# ============================================
Write-Host "VERIFICACIÓN 1: Carpetas requeridas..." -ForegroundColor Yellow

$carpetasRequeridas = @(
    "src\components\common",
    "src\config",
    "src\features\admin\components",
    "src\features\admin\hooks",
    "src\features\admin\screens",
    "src\features\admin\services",
    "src\features\auth\contexts",
    "src\features\auth\screens",
    "src\features\auth\services",
    "src\features\canchas\services",
    "src\features\reservas\services",
    "src\features\user\screens",
    "src\features\user\services",
    "src\navigation",
    "src\styles",
    "src\types",
    "src\utils"
)

foreach ($carpeta in $carpetasRequeridas) {
    if (Test-Path $carpeta) {
        Write-Host "  ✓ Existe: $carpeta" -ForegroundColor Green
        $exitos++
    } else {
        Write-Host "  ❌ Falta: $carpeta" -ForegroundColor Red
        $errores++
    }
}

Write-Host ""

# ============================================
# VERIFICACIÓN 2: Carpetas que NO deben existir
# ============================================
Write-Host "VERIFICACIÓN 2: Carpetas que deben estar eliminadas..." -ForegroundColor Yellow

$carpetasProhibidas = @(
    "src\components\admin",
    "src\components\user",
    "src\components\layouts",
    "src\components\features",
    "src\context",
    "src\theme",
    "src\screens",
    "src\hooks",
    "src\services",
    "src\features\admin\contexts",
    "src\features\auth\hooks",
    "src\features\user\contexts",
    "src\features\user\hooks"
)

foreach ($carpeta in $carpetasProhibidas) {
    if (-not (Test-Path $carpeta)) {
        Write-Host "  ✓ Eliminada: $carpeta" -ForegroundColor Green
        $exitos++
    } else {
        Write-Host "  ⚠ Aún existe: $carpeta" -ForegroundColor Yellow
        $advertencias++
    }
}

Write-Host ""

# ============================================
# VERIFICACIÓN 3: Archivos críticos
# ============================================
Write-Host "VERIFICACIÓN 3: Archivos críticos en ubicaciones correctas..." -ForegroundColor Yellow

$archivosRequeridos = @{
    "src\features\admin\hooks\useReservasAdmin.ts" = "Hook admin"
    "src\features\admin\components\AdminCalendar.tsx" = "Componente admin"
    "src\features\auth\contexts\AuthContext.tsx" = "AuthContext"
    "src\features\auth\contexts\ThemeContext.tsx" = "ThemeContext"
    "src\features\user\services\userReservasService.ts" = "Servicio user"
}

foreach ($archivo in $archivosRequeridos.Keys) {
    $descripcion = $archivosRequeridos[$archivo]
    if (Test-Path $archivo) {
        Write-Host "  ✓ $descripcion`: $archivo" -ForegroundColor Green
        $exitos++
    } else {
        Write-Host "  ❌ Falta $descripcion`: $archivo" -ForegroundColor Red
        $errores++
    }
}

Write-Host ""

# ============================================
# VERIFICACIÓN 4: Imports rotos
# ============================================
Write-Host "VERIFICACIÓN 4: Buscando imports rotos comunes..." -ForegroundColor Yellow

$patronesRotos = @(
    "from '../context/AuthContext'",
    "from '../context/ThemeContext'",
    "from '../../context/",
    "from '../../../context/",
    "from '../services/reservaService'",
    "from '../../../components/features/admin/"
)

$archivosConImportsRotos = @()

$todosLosArchivos = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" -File

foreach ($archivo in $todosLosArchivos) {
    $contenido = Get-Content -Path $archivo.FullName -Raw
    foreach ($patron in $patronesRotos) {
        if ($contenido -match [regex]::Escape($patron)) {
            $archivosConImportsRotos += "$($archivo.FullName) → '$patron'"
        }
    }
}

if ($archivosConImportsRotos.Count -eq 0) {
    Write-Host "  ✓ No se encontraron imports rotos comunes" -ForegroundColor Green
    $exitos++
} else {
    Write-Host "  ⚠ Se encontraron posibles imports rotos:" -ForegroundColor Yellow
    foreach ($item in $archivosConImportsRotos) {
        Write-Host "    - $item" -ForegroundColor Yellow
    }
    $advertencias += $archivosConImportsRotos.Count
}

Write-Host ""

# ============================================
# VERIFICACIÓN 5: Cantidad de componentes admin
# ============================================
Write-Host "VERIFICACIÓN 5: Verificando componentes admin..." -ForegroundColor Yellow

$componentesAdmin = Get-ChildItem -Path "src\features\admin\components\*.tsx" -File -ErrorAction SilentlyContinue

if ($componentesAdmin.Count -ge 14) {
    Write-Host "  ✓ Se encontraron $($componentesAdmin.Count) componentes admin" -ForegroundColor Green
    $exitos++
} elseif ($componentesAdmin.Count -gt 0) {
    Write-Host "  ⚠ Se encontraron solo $($componentesAdmin.Count) componentes admin (esperados: 15)" -ForegroundColor Yellow
    $advertencias++
} else {
    Write-Host "  ❌ No se encontraron componentes admin en la ubicación correcta" -ForegroundColor Red
    $errores++
}

Write-Host ""

# ============================================
# VERIFICACIÓN 6: Estructura de carpetas común
# ============================================
Write-Host "VERIFICACIÓN 6: Verificando componentes comunes..." -ForegroundColor Yellow

$componentesComunes = @(
    "src\components\common\Button.tsx",
    "src\components\common\Input.tsx",
    "src\components\common\Loading.tsx",
    "src\components\common\StatusBarManager.tsx",
    "src\components\common\index.tsx"
)

$todosExisten = $true
foreach ($comp in $componentesComunes) {
    if (-not (Test-Path $comp)) {
        $todosExisten = $false
        Write-Host "  ❌ Falta: $comp" -ForegroundColor Red
        $errores++
    }
}

if ($todosExisten) {
    Write-Host "  ✓ Todos los componentes comunes están presentes" -ForegroundColor Green
    $exitos++
}

Write-Host ""

# ============================================
# VERIFICACIÓN 7: Git status (opcional)
# ============================================
Write-Host "VERIFICACIÓN 7: Estado de Git..." -ForegroundColor Yellow

try {
    $gitStatus = git status --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        $cambios = ($gitStatus | Measure-Object).Count
        if ($cambios -gt 0) {
            Write-Host "  ℹ Hay $cambios archivos modificados (normal después de reorganización)" -ForegroundColor Cyan
            Write-Host "    Ejecuta 'git diff' para ver los cambios" -ForegroundColor Gray
        } else {
            Write-Host "  ℹ No hay cambios pendientes" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ℹ No es un repositorio Git o Git no está disponible" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ℹ No se pudo verificar el estado de Git" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verificaciones exitosas: $exitos" -ForegroundColor Green
Write-Host "Advertencias: $advertencias" -ForegroundColor Yellow
Write-Host "Errores: $errores" -ForegroundColor Red
Write-Host ""

if ($errores -eq 0 -and $advertencias -eq 0) {
    Write-Host "✅ ¡PERFECTO! La reorganización se completó correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "SIGUIENTES PASOS:" -ForegroundColor Cyan
    Write-Host "1. Probar la aplicación: npm start" -ForegroundColor White
    Write-Host "2. Verificar que todo funciona correctamente" -ForegroundColor White
    Write-Host "3. Hacer commit: git add . && git commit -m 'refactor: reorganizar estructura'" -ForegroundColor White
} elseif ($errores -eq 0) {
    Write-Host "⚠️  La reorganización se completó con advertencias" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Revisa las advertencias arriba y corrige si es necesario." -ForegroundColor Yellow
    Write-Host "Algunas advertencias pueden ser normales." -ForegroundColor Gray
} else {
    Write-Host "❌ Se encontraron errores en la reorganización" -ForegroundColor Red
    Write-Host ""
    Write-Host "ACCIONES RECOMENDADAS:" -ForegroundColor Yellow
    Write-Host "1. Revisa los errores listados arriba" -ForegroundColor White
    Write-Host "2. Ejecuta nuevamente los scripts de reorganización" -ForegroundColor White
    Write-Host "3. Si persisten los problemas, revierte: git checkout ." -ForegroundColor White
}

Write-Host ""
