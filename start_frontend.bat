@echo off
echo Starting the Frontend Development Server...

echo === Installing frontend dependencies ===
call npm install

echo === Starting Vite dev server ===
npm run dev 