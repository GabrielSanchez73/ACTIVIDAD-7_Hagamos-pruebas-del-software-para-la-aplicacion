@echo off
echo ========================================
echo    TechSalle - Sistema de Productos
echo    Frontend Moderno v2.0
echo ========================================
echo.

echo Iniciando servidor backend...
start "Backend TechSalle" cmd /k "cd /d %~dp0server && npm start"

echo Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak > nul

echo Iniciando frontend...
start "Frontend TechSalle" cmd /k "cd /d %~dp0client && npm start"

echo.
echo ========================================
echo    Servidores iniciados correctamente
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:4000
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
