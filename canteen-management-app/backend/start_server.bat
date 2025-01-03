@echo off
cd /d "%~dp0"
start cmd /k "npx nodemon server.js"
timeout /t 5 > nul
start "" "http://127.0.0.1:5000/dashboard"
