# ============================================
# SCRIPT MAESTRO DE REORGANIZACIÓN - NorthPadel Mobile
# ============================================
# Este script ejecuta todo el proceso de reorganización en orden:
# 1. Reorganiza la estructura
# 2. Actualiza los imports
# 3. Verifica que todo esté correcto
#
# IMPORTANTE: 
# - Ejecutar desde la raíz del proyecto mobile/
# - Se recomienda hacer backup o tener cambios commiteados antes
# - Revisar los resultados antes de hacer commit
#
# USO: .\reorganize-all.ps1
# ============================================

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                                                               " -ForegroundColor Cyan
Write-Host "      REORGANIZACION COMPLETA - NORTHPADEL MOBILE              " -ForegroundColor Cyan
Write-Host "                                                               " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "src")) {
    Write-Host "[ERROR] Debes ejecutar este script desde la carpeta mobile/" -ForegroundColor Red
    exit 1
}

# Verificar que los scripts existen
$scripts = @(
    "reorganize-structure.ps1",
    "update-imports.ps1",
    "verify-structure.ps1"
)

$faltanScripts = $false
foreach ($script in $scripts) {
    if (-not (Test-Path $script)) {
        Write-Host "[ERROR] No se encuentra el script: $script" -ForegroundColor Red
        $faltanScripts = $true
    }
}

if ($faltanScripts) {
    Write-Host ""
    Write-Host "Asegurate de que todos los scripts esten en la carpeta mobile/" -ForegroundColor Yellow
    exit 1
}

# Confirmacion del usuario
Write-Host "[!] ADVERTENCIA:" -ForegroundColor Yellow
Write-Host "   Este script modificara la estructura de carpetas y archivos." -ForegroundColor Yellow
Write-Host "   Asegurate de tener un backup o commits previos." -ForegroundColor Yellow
Write-Host ""
Write-Host "Deseas continuar? (S/N): " -ForegroundColor Cyan -NoNewline
$confirmacion = Read-Host

if ($confirmacion -ne "S" -and $confirmacion -ne "s") {
    Write-Host ""
    Write-Host "[X] Operacion cancelada por el usuario" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Iniciando reorganizacion completa..." -ForegroundColor Green
Write-Host ""

# ============================================
# PASO 1: REORGANIZAR ESTRUCTURA
# ============================================
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host "   PASO 1/3: Reorganizando estructura de carpetas             " -ForegroundColor Magenta
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host ""

try {
    & .\reorganize-structure.ps1
    if ($LASTEXITCODE -ne 0) {
        throw "Error en reorganize-structure.ps1"
    }
    Write-Host ""
    Write-Host "[OK] Paso 1 completado exitosamente" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
} catch {
    Write-Host ""
    Write-Host "[ERROR] ERROR en Paso 1: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "La reorganizacion se detuvo. Revisa los errores arriba." -ForegroundColor Yellow
    exit 1
}

# ============================================
# PASO 2: ACTUALIZAR IMPORTS
# ============================================
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host "   PASO 2/3: Actualizando imports                             " -ForegroundColor Magenta
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host ""

try {
    & .\update-imports.ps1
    if ($LASTEXITCODE -ne 0) {
        throw "Error en update-imports.ps1"
    }
    Write-Host ""
    Write-Host "[OK] Paso 2 completado exitosamente" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 2
} catch {
    Write-Host ""
    Write-Host "[ERROR] ERROR en Paso 2: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "La actualizacion de imports fallo. Revisa los errores arriba." -ForegroundColor Yellow
    exit 1
}

# ============================================
# PASO 3: VERIFICAR ESTRUCTURA
# ============================================
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host "   PASO 3/3: Verificando estructura final                     " -ForegroundColor Magenta
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host ""

try {
    & .\verify-structure.ps1
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "[!] Hubo un problema en la verificacion" -ForegroundColor Yellow
}

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                                                               " -ForegroundColor Cyan
Write-Host "             [OK] REORGANIZACION COMPLETADA                    " -ForegroundColor Cyan
Write-Host "                                                               " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[>] PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "[1] Revisar cambios:" -ForegroundColor Cyan
Write-Host "   git status" -ForegroundColor White
Write-Host "   git diff" -ForegroundColor White
Write-Host ""
Write-Host "[2] Probar la aplicacion:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host "   # o" -ForegroundColor Gray
Write-Host "   expo start" -ForegroundColor White
Write-Host ""
Write-Host "[3] Verificar compilacion:" -ForegroundColor Cyan
Write-Host "   - Abre la app en el emulador/dispositivo" -ForegroundColor White
Write-Host "   - Navega por las pantallas principales" -ForegroundColor White
Write-Host "   - Verifica que no hay errores de imports" -ForegroundColor White
Write-Host ""
Write-Host "[4] Si todo funciona correctamente:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m ""refactor: reorganizar estructura siguiendo feature-based architecture""" -ForegroundColor White
Write-Host ""
Write-Host "[5] Si hay problemas:" -ForegroundColor Cyan
Write-Host "   git checkout .    # Revertir todos los cambios" -ForegroundColor White
Write-Host "   git clean -fd     # Limpiar archivos no tracked" -ForegroundColor White
Write-Host ""

Write-Host "[*] DOCUMENTACION:" -ForegroundColor Yellow
Write-Host "   Lee REORGANIZACION.md para mas detalles" -ForegroundColor White
Write-Host ""

# Mostrar archivos modificados si git está disponible
try {
    $gitStatus = git status --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        $cambios = ($gitStatus | Measure-Object).Count
        if ($cambios -gt 0) {
            Write-Host "[*] RESUMEN DE CAMBIOS:" -ForegroundColor Yellow
            Write-Host "   $cambios archivos modificados" -ForegroundColor White
            Write-Host ""
        }
    }
} catch {
    # Git no disponible, no mostrar nada
}

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
