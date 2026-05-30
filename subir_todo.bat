@echo off
setlocal enabledelayedexpansion
title Subidor Inteligente de Onii-chan ✨
color 0b

echo -----------------------------------------------
echo    Escaneando archivos pesados (limite 100MB)
echo -----------------------------------------------

set "hubo_pesados=no"
set "lista_pesados="

:: 1. Escaneo de archivos mayores a 100MB
for /r %%f in (*) do (
    if %%~zf gtr 104857600 (
        set "hubo_pesados=yes"
        set "nombre=%%~nxf"
        
        :: Verificar si ya esta en .gitignore para no repetir
        findstr /x /c:"!nombre!" .gitignore >nul 2>&1
        if errorlevel 1 (
            echo !nombre! >> .gitignore
            echo [OCULTADO] !nombre! por exceso de peso.
        )
        set "lista_pesados=!lista_pesados! - !nombre! "
    )
)

:: 2. Proceso de Git
echo.
echo Preparando subida...
git add .
git commit -m "Subida automatica inteligente"
echo Enviando a GitHub...
git push origin main --force

:: 3. Reporte Final
echo -----------------------------------------------
if "!hubo_pesados!"=="yes" (
    echo [!] ATENCION: Los siguientes archivos eran muy pesados
    echo     y se ocultaron de GitHub para evitar errores:
    echo !lista_pesados!
) else (
    echo [OK] ¡Todo era ligero! Subida limpia completada.
)
echo -----------------------------------------------
echo    ¡Ya podemos jugar, Onii-chan! 🍱
pause