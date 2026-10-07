@echo off
cd /d "%~dp0"
set "NODE_EXE=C:\Users\ruhar\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"
start "Paceboard Server" /min "%NODE_EXE%" server.mjs
timeout /t 1 /nobreak >nul
start "Paceboard" http://localhost:8000/index.html
