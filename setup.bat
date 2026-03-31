@echo off
REM TaskFlow Quick Setup Script for Windows

echo.
echo 🚀 TaskFlow - Quick Setup (Windows)
echo ==================================
echo.

REM Check Node.js
echo 📋 Checking Node.js...
node -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do echo ✓ Node.js found: %%i
) else (
    echo ✗ Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)

REM Check npm
echo 📋 Checking npm...
npm -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm -v') do echo ✓ npm found: %%i
) else (
    echo ✗ npm not found. Please install Node.js
    pause
    exit /b 1
)

REM Setup Backend
echo.
echo 🔧 Setting up Backend...
cd backend

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env with your MongoDB URI:
    echo    MONGO_URI=mongodb://localhost:27017/taskflow
    echo    JWT_SECRET=your_super_secret_key
)

echo Installing backend dependencies...
call npm install

echo.
echo ✓ Backend setup complete!
echo   To start: cd backend ^&^& npm start

REM Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd ..\frontend

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
)

echo.
echo ✓ Frontend setup complete!
echo   To start: cd frontend ^&^& python -m http.server 3000

echo.
echo ==================================
echo ✅ Setup Complete!
echo ==================================
echo.
echo 📌 Next Steps:
echo 1. Ensure MongoDB is running
echo 2. Start Backend:   cd backend ^&^& npm start
echo 3. Start Frontend:  cd frontend ^&^& python -m http.server 3000
echo 4. Open browser:    http://localhost:3000
echo.
echo 📖 For more help, see README.md
echo.
pause
