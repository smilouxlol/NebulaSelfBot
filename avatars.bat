@echo off
title NEBULA - Preparación de Entorno
color 05

echo Creando carpeta de avatares...
if not exist "avatars" mkdir "avatars"

echo Creando archivo de instrucciones...
(
echo ==================================================
echo         INSTRUCCIONES DE USO - NEBULA
echo ==================================================
echo.
echo 1. AVATARES:
echo    - Coloca todos tus archivos (.png, .jpg, .gif) 
echo      dentro de esta carpeta.
echo    - El bot los rotara automaticamente.
echo.
echo 2. CONFIGURACION:
echo    - Asegurate de tener tu archivo .env con el 
echo      DISCORD_TOKEN configurado.
echo    - Usa el archivo text.txt para tus estados.
echo.
echo ==================================================
echo       Disfruta de la Nebulosa. 💜
) > "avatars\instrucciones.txt"

echo.
echo Proceso completado exitosamente.
echo Carpeta 'avatars' creada con 'instrucciones.txt'.
echo Presiona cualquier tecla para salir...
pause >nul
