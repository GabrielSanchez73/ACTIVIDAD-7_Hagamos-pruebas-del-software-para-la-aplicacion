@echo off
title Sistema de Gestion de Productos

echo ========================================
echo SISTEMA DE GESTION DE PRODUCTOS
echo ========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado

echo.
echo Verificando dependencias del servidor...
if not exist "server\node_modules" (
    echo Instalando dependencias del servidor...
    cd server
    npm install
    if %errorlevel% neq 0 (
        echo Error al instalar dependencias del servidor
        pause
        exit /b 1
    )
    cd ..
    echo Dependencias del servidor instaladas
) else (
    echo Dependencias del servidor ya estan instaladas
)

echo.
echo Verificando dependencias del cliente...
if not exist "client\node_modules" (
    echo Instalando dependencias del cliente...
    cd client
    npm install
    if %errorlevel% neq 0 (
        echo Error al instalar dependencias del cliente
        pause
        exit /b 1
    )
    cd ..
    echo Dependencias del cliente instaladas
) else (
    echo Dependencias del cliente ya estan instaladas
)

echo.
echo ========================================
echo INICIANDO SISTEMA
echo ========================================
echo.
echo Iniciando servidor en puerto 5000...
start "Servidor" cmd /k "cd /d %cd%\server && npm start"

timeout /t 3 /nobreak >nul

echo Iniciando cliente en puerto 3000...
start "Cliente" cmd /k "cd /d %cd%\client && npm start"

echo.
echo Sistema iniciado:
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
