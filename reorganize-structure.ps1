# ============================================
# SCRIPT DE REORGANIZACIÓN - NorthPadel Mobile
# ============================================
# Este script reorganiza la estructura del proyecto React Native
# eliminando carpetas vacías y moviendo archivos a su ubicación correcta
#
# IMPORTANTE: 
# - Ejecutar desde la raíz del proyecto mobile/
# - Revisar el resumen al final
# - Los imports se actualizarán en el siguiente paso
#
# USO: .\reorganize-structure.ps1
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REORGANIZACIÓN DE ESTRUCTURA" -ForegroundColor Cyan
Write-Host "  Proyecto: NorthPadel Mobile" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "src")) {
    Write-Host "[ERROR] Debes ejecutar este script desde la carpeta mobile/" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Directorio correcto detectado" -ForegroundColor Green
Write-Host ""

# Contador de operaciones
$movimientos = 0
$eliminaciones = 0
$creaciones = 0

# ============================================
# PASO 1: CREAR CARPETAS NECESARIAS
# ============================================
Write-Host "PASO 1: Creando carpetas necesarias..." -ForegroundColor Yellow

$carpetasCrear = @(
    "src\features\admin\components",
    "src\features\admin\hooks",
    "src\features\user\services"
)

foreach ($carpeta in $carpetasCrear) {
    if (-not (Test-Path $carpeta)) {
        New-Item -ItemType Directory -Path $carpeta -Force | Out-Null
        Write-Host "  [+] Creada: $carpeta" -ForegroundColor Green
        $creaciones++
    } else {
        Write-Host "  [i] Ya existe: $carpeta" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# PASO 2: MOVER COMPONENTES ADMIN
# ============================================
Write-Host "PASO 2: Moviendo componentes admin..." -ForegroundColor Yellow

$componentesAdmin = @(
    "AdminCalendar.tsx",
    "AdminCalendarEnhanced.tsx",
    "AdminHeader.tsx",
    "CourtAvailability.tsx",
    "CourtTabs.tsx",
    "CourtsAvailability.tsx",
    "EmptyState.tsx",
    "EnhancedFilters.tsx",
    "EnhancedHeader.tsx",
    "EnhancedReservationCard.tsx",
    "FloatingActionButton.tsx",
    "ReservationCard.tsx",
    "SearchBar.tsx",
    "SkeletonLoading.tsx",
    "StatusDropdown.tsx"
)

foreach ($archivo in $componentesAdmin) {
    $origen = "src\components\features\admin\$archivo"
    $destino = "src\features\admin\components\$archivo"
    
    if (Test-Path $origen) {
        Move-Item -Path $origen -Destination $destino -Force
        Write-Host "  [+] Movido: $archivo" -ForegroundColor Green
        $movimientos++
    } else {
        Write-Host "  [!] No encontrado: $archivo" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# PASO 3: MOVER HOOK ADMIN
# ============================================
Write-Host "PASO 3: Moviendo hook useReservasAdmin..." -ForegroundColor Yellow

if (Test-Path "src\hooks\useReservasAdmin.ts") {
    Move-Item -Path "src\hooks\useReservasAdmin.ts" -Destination "src\features\admin\hooks\useReservasAdmin.ts" -Force
    Write-Host "  [+] Movido: useReservasAdmin.ts" -ForegroundColor Green
    $movimientos++
} else {
    Write-Host "  [!] No encontrado: useReservasAdmin.ts" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PASO 4: MOVER SERVICIO USER
# ============================================
Write-Host "PASO 4: Moviendo servicio userReservasService..." -ForegroundColor Yellow

if (Test-Path "src\services\userReservasService.ts") {
    Move-Item -Path "src\services\userReservasService.ts" -Destination "src\features\user\services\userReservasService.ts" -Force
    Write-Host "  [+] Movido: userReservasService.ts" -ForegroundColor Green
    $movimientos++
} else {
    Write-Host "  [!] No encontrado: userReservasService.ts" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PASO 5: ELIMINAR CARPETAS VACÍAS
# ============================================
Write-Host "PASO 5: Eliminando carpetas vacías y redundantes..." -ForegroundColor Yellow

# Lista de carpetas a eliminar (en orden específico)
$carpetasEliminar = @(
    # Carpetas en components/features
    "src\components\features\admin",
    "src\components\features\auth",
    "src\components\features\canchas",
    "src\components\features\perfil",
    "src\components\features\reservas",
    "src\components\features\user",
    "src\components\features",
    # Carpetas en components raíz
    "src\components\admin",
    "src\components\user",
    "src\components\layouts",
    # Carpetas en screens
    "src\screens\admin",
    "src\screens\auth",
    "src\screens\user",
    "src\screens",
    # Carpetas raíz
    "src\context",
    "src\theme",
    "src\hooks",
    "src\services",
    # Carpetas vacías en features
    "src\features\admin\contexts",
    "src\features\auth\hooks",
    "src\features\user\contexts",
    "src\features\user\hooks"
)

foreach ($carpeta in $carpetasEliminar) {
    if (Test-Path $carpeta) {
        # Verificar si está vacía
        $items = Get-ChildItem -Path $carpeta -Recurse -Force
        if ($items.Count -eq 0) {
            Remove-Item -Path $carpeta -Recurse -Force
            Write-Host "  [-] Eliminada: $carpeta" -ForegroundColor Green
            $eliminaciones++
        } else {
            Write-Host "  [!] No vacia (omitida): $carpeta" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [i] No existe: $carpeta" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================
# RESUMEN
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE OPERACIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Carpetas creadas:  $creaciones" -ForegroundColor Green
Write-Host "Archivos movidos:  $movimientos" -ForegroundColor Green
Write-Host "Carpetas eliminadas: $eliminaciones" -ForegroundColor Green
Write-Host ""
Write-Host "[OK] Reorganizacion completada!" -ForegroundColor Green
Write-Host ""
Write-Host "[!] SIGUIENTE PASO IMPORTANTE:" -ForegroundColor Yellow
Write-Host "    Ejecutar el script de actualizacion de imports" -ForegroundColor Yellow
Write-Host "    .\update-imports.ps1" -ForegroundColor White
Write-Host ""
