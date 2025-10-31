# ============================================
# SCRIPT DE ACTUALIZACIÓN DE IMPORTS - NorthPadel Mobile
# ============================================
# Este script actualiza todos los imports después de la reorganización
#
# IMPORTANTE: 
# - Ejecutar DESPUÉS de reorganize-structure.ps1
# - Ejecutar desde la raíz del proyecto mobile/
# - Revisar cambios antes de commitear
#
# USO: .\update-imports.ps1
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACTUALIZACIÓN DE IMPORTS" -ForegroundColor Cyan
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
$archivosActualizados = 0

# ============================================
# FUNCIÓN: Actualizar imports en un archivo
# ============================================
function Update-Imports {
    param (
        [string]$FilePath,
        [hashtable]$Replacements
    )
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    foreach ($old in $Replacements.Keys) {
        $new = $Replacements[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $FilePath -Value $content -Encoding UTF8 -NoNewline
        return $true
    }
    
    return $false
}

# ============================================
# MAPEO DE CAMBIOS DE IMPORTS
# ============================================

# 1. Actualizaciones para App.tsx
Write-Host "Actualizando App.tsx..." -ForegroundColor Yellow
$appReplacements = @{
    './src/context/AuthContext' = './src/features/auth/contexts/AuthContext'
    './src/context/ThemeContext' = './src/features/auth/contexts/ThemeContext'
}

if (Update-Imports -FilePath "App.tsx" -Replacements $appReplacements) {
    Write-Host "  [+] App.tsx actualizado" -ForegroundColor Green
    $archivosActualizados++
} else {
    Write-Host "  [i] App.tsx - sin cambios" -ForegroundColor Gray
}

# 2. Actualizaciones para navigation/AppNavigator.tsx
Write-Host "Actualizando navigation/AppNavigator.tsx..." -ForegroundColor Yellow
$navReplacements = @{
    '../context/AuthContext' = '../features/auth/contexts/AuthContext'
}

if (Update-Imports -FilePath "src\navigation\AppNavigator.tsx" -Replacements $navReplacements) {
    Write-Host "  [+] AppNavigator.tsx actualizado" -ForegroundColor Green
    $archivosActualizados++
} else {
    Write-Host "  [i] AppNavigator.tsx - sin cambios" -ForegroundColor Gray
}

# 3. Actualizaciones para hooks/useReservasAdmin.ts (ahora en features/admin/hooks)
Write-Host "Actualizando features/admin/hooks/useReservasAdmin.ts..." -ForegroundColor Yellow
$hookReplacements = @{
    "from '../context/AuthContext'" = "from '../../auth/contexts/AuthContext'"
    "from '../services/reservaService'" = "from '../services/admin.service'"
    "from '../types/reservas.types'" = "from '../../../types/reservas.types'"
}

if (Update-Imports -FilePath "src\features\admin\hooks\useReservasAdmin.ts" -Replacements $hookReplacements) {
    Write-Host "  [+] useReservasAdmin.ts actualizado" -ForegroundColor Green
    $archivosActualizados++
} else {
    Write-Host "  [i] useReservasAdmin.ts - sin cambios" -ForegroundColor Gray
}

# 4. Buscar y actualizar todos los archivos que importan componentes admin
Write-Host ""
Write-Host "Buscando archivos que importan componentes admin..." -ForegroundColor Yellow

$adminScreens = Get-ChildItem -Path "src\features\admin\screens\*.tsx" -File

foreach ($screen in $adminScreens) {
    $replacements = @{
        "from '../../../components/features/admin/" = "from '../components/"
        "from '../../components/features/admin/" = "from '../components/"
    }
    
    if (Update-Imports -FilePath $screen.FullName -Replacements $replacements) {
        Write-Host "  [+] $($screen.Name) actualizado" -ForegroundColor Green
        $archivosActualizados++
    }
}

# 5. Actualizar imports de AuthContext en todas las pantallas
Write-Host ""
Write-Host "Actualizando imports de AuthContext en pantallas..." -ForegroundColor Yellow

$allScreens = Get-ChildItem -Path "src\features" -Recurse -Filter "*.tsx" | Where-Object { $_.DirectoryName -like "*screens*" }

foreach ($screen in $allScreens) {
    $replacements = @{
        "from '../../../context/AuthContext'" = "from '../../auth/contexts/AuthContext'"
        "from '../../context/AuthContext'" = "from '../auth/contexts/AuthContext'"
        "from '../context/AuthContext'" = "from '../contexts/AuthContext'"
    }
    
    if (Update-Imports -FilePath $screen.FullName -Replacements $replacements) {
        Write-Host "  [+] $($screen.Name) actualizado" -ForegroundColor Green
        $archivosActualizados++
    }
}

# 6. Actualizar imports de ThemeContext
Write-Host ""
Write-Host "Actualizando imports de ThemeContext..." -ForegroundColor Yellow

$allTsFiles = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" -File

foreach ($file in $allTsFiles) {
    $replacements = @{
        "from '../../../context/ThemeContext'" = "from '../../auth/contexts/ThemeContext'"
        "from '../../context/ThemeContext'" = "from '../auth/contexts/ThemeContext'"
        "from '../context/ThemeContext'" = "from '../contexts/ThemeContext'"
    }
    
    if (Update-Imports -FilePath $file.FullName -Replacements $replacements) {
        Write-Host "  [+] $($file.Name) actualizado" -ForegroundColor Green
        $archivosActualizados++
    }
}

# 7. Actualizar imports del servicio userReservasService
Write-Host ""
Write-Host "Buscando referencias a userReservasService..." -ForegroundColor Yellow

foreach ($file in $allTsFiles) {
    $replacements = @{
        "from '../services/userReservasService'" = "from '../features/user/services/userReservasService'"
        "from '../../services/userReservasService'" = "from '../user/services/userReservasService'"
    }
    
    if (Update-Imports -FilePath $file.FullName -Replacements $replacements) {
        Write-Host "  [+] $($file.Name) actualizado" -ForegroundColor Green
        $archivosActualizados++
    }
}

# 8. Actualizar imports en servicios
Write-Host ""
Write-Host "Actualizando imports en servicios..." -ForegroundColor Yellow

$authService = "src\features\auth\services\authentication.service.ts"
if (Test-Path $authService) {
    $replacements = @{
        "from '../../../context/AuthContext'" = "from '../contexts/AuthContext'"
    }
    
    if (Update-Imports -FilePath $authService -Replacements $replacements) {
        Write-Host "  [+] authentication.service.ts actualizado" -ForegroundColor Green
        $archivosActualizados++
    }
}

# ============================================
# RESUMEN
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DE OPERACIONES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Archivos actualizados: $archivosActualizados" -ForegroundColor Green
Write-Host ""
Write-Host "[OK] Actualizacion de imports completada!" -ForegroundColor Green
Write-Host ""
Write-Host "[>] SIGUIENTES PASOS:" -ForegroundColor Yellow
Write-Host "1. Revisar los cambios con: git diff" -ForegroundColor White
Write-Host "2. Probar la aplicación: npm start" -ForegroundColor White
Write-Host "3. Verificar que no hay errores de compilación" -ForegroundColor White
Write-Host "4. Si todo funciona, hacer commit de los cambios" -ForegroundColor White
Write-Host ""
