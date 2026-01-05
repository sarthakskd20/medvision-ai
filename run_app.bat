@echo off
setlocal enabledelayedexpansion

:: ============================================
:: MedVision AI - One-Click Setup and Run
:: ============================================
:: This script will:
:: 1. Check required software (Node.js, Python)
:: 2. Install dependencies for frontend and backend
:: 3. Verify environment configuration
:: 4. Start both servers
:: 5. Open the application in your default browser
:: ============================================

title MedVision AI - Setup

echo.
echo  =============================================
echo   MedVision AI - Clinical Time Machine
echo   One-Click Setup and Run
echo  =============================================
echo.

:: Store the root directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: ============================================
:: STEP 1: Check Required Software
:: ============================================
echo [STEP 1/6] Checking required software...
echo.

:: Check Node.js
echo   Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [FAIL] Node.js is not installed.
    echo.
    echo   Please install Node.js from: https://nodejs.org/
    echo   Recommended version: 18.x or higher
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
    echo   [OK] Node.js !NODE_VER! found
)

:: Check npm
echo   Checking npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo   [FAIL] npm is not installed.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%v in ('npm --version') do set NPM_VER=%%v
    echo   [OK] npm v!NPM_VER! found
)

:: Check Python
echo   Checking Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo   [FAIL] Python is not installed.
    echo.
    echo   Please install Python from: https://www.python.org/
    echo   Recommended version: 3.11 or higher
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%v in ('python --version') do set PYTHON_VER=%%v
    echo   [OK] !PYTHON_VER! found
)

:: Check pip
echo   Checking pip...
python -m pip --version >nul 2>nul
if %errorlevel% neq 0 (
    echo   [FAIL] pip is not installed.
    pause
    exit /b 1
) else (
    echo   [OK] pip found
)

echo.
echo   All required software is installed.
echo.

:: ============================================
:: STEP 2: Setup Backend
:: ============================================
echo [STEP 2/6] Setting up Backend...
echo.

cd /d "%ROOT_DIR%backend"

:: Check if venv exists
if not exist "venv" (
    echo   Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo   [FAIL] Could not create virtual environment.
        pause
        exit /b 1
    )
    echo   [OK] Virtual environment created
)

:: Activate venv and install requirements
echo   Activating virtual environment...
call venv\Scripts\activate.bat

echo   Installing Python dependencies...
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo   [WARNING] Some dependencies may have failed to install.
) else (
    echo   [OK] Python dependencies installed
)

cd /d "%ROOT_DIR%"
echo.

:: ============================================
:: STEP 3: Setup Frontend
:: ============================================
echo [STEP 3/6] Setting up Frontend...
echo.

cd /d "%ROOT_DIR%frontend"

:: Check if node_modules exists
if not exist "node_modules" (
    echo   Installing Node.js dependencies (this may take a minute)...
    call npm install
    if %errorlevel% neq 0 (
        echo   [FAIL] npm install failed.
        pause
        exit /b 1
    )
    echo   [OK] Node.js dependencies installed
) else (
    echo   [OK] Node.js dependencies already installed
)

cd /d "%ROOT_DIR%"
echo.

:: ============================================
:: STEP 4: Check Environment Configuration
:: ============================================
echo [STEP 4/6] Checking environment configuration...
echo.

:: Check backend .env
if not exist "backend\.env" (
    echo   [WARNING] backend\.env file not found!
    echo.
    echo   Please create backend\.env with the following:
    echo   GEMINI_API_KEY=your_api_key_here
    echo.
    if exist "backend\.env.example" (
        echo   Copying from .env.example...
        copy "backend\.env.example" "backend\.env" >nul
        echo   [OK] Created backend\.env from template
        echo   [WARNING] Please update GEMINI_API_KEY in backend\.env
    )
) else (
    echo   [OK] backend\.env exists
    
    :: Check if GEMINI_API_KEY is set
    findstr /C:"GEMINI_API_KEY=your" "backend\.env" >nul 2>nul
    if %errorlevel% equ 0 (
        echo   [WARNING] GEMINI_API_KEY is not configured in backend\.env
        echo            Please update it with your actual API key.
    )
)

:: Check frontend .env.local
if not exist "frontend\.env.local" (
    echo   Creating frontend\.env.local...
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env.local" >nul
        echo   [OK] Created frontend\.env.local from template
    ) else (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000 > "frontend\.env.local"
        echo   [OK] Created frontend\.env.local
    )
) else (
    echo   [OK] frontend\.env.local exists
)

echo.

:: ============================================
:: STEP 5: Start Backend Server
:: ============================================
echo [STEP 5/6] Starting Backend Server...
echo.

cd /d "%ROOT_DIR%backend"
call venv\Scripts\activate.bat

:: Start backend in new window
start "MedVision AI - Backend" cmd /k "cd /d %ROOT_DIR%backend && venv\Scripts\activate.bat && echo Starting FastAPI server on http://localhost:8000 && echo. && uvicorn app.main:app --reload --port 8000"

echo   [OK] Backend starting on http://localhost:8000
echo.

:: Wait for backend to start
echo   Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

cd /d "%ROOT_DIR%"

:: ============================================
:: STEP 6: Start Frontend Server
:: ============================================
echo [STEP 6/6] Starting Frontend Server...
echo.

cd /d "%ROOT_DIR%frontend"

:: Start frontend in new window
start "MedVision AI - Frontend" cmd /k "cd /d %ROOT_DIR%frontend && echo Starting Next.js server on http://localhost:3000 && echo. && npm run dev"

echo   [OK] Frontend starting on http://localhost:3000
echo.

:: Wait for frontend to start
echo   Waiting for frontend to initialize...
timeout /t 8 /nobreak >nul

:: ============================================
:: STEP 7: Open Browser
:: ============================================
echo.
echo  =============================================
echo   Setup Complete!
echo  =============================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
echo   Opening browser...
echo.

:: Open default browser to frontend
start "" "http://localhost:3000"

echo.
echo  =============================================
echo   MedVision AI is running!
echo  =============================================
echo.
echo   To stop the servers, close the terminal
echo   windows or press Ctrl+C in each.
echo.
echo   Press any key to exit this window...
pause >nul

endlocal
