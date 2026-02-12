@echo off
cd /d "%~dp0"
start http://localhost:3077
npm run dev -- -p 3077
