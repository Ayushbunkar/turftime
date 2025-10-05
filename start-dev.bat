@echo off
echo Starting TurfTime Development Environment...
echo.

echo Starting Server...
start "Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Client...
start "Client" cmd /k "cd client && npm run dev"

echo.
echo Development servers are starting...
echo Server will be available at: http://localhost:3000
echo Client will be available at: http://localhost:5173
echo.
pause