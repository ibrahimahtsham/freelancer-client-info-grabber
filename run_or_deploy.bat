@echo off
setlocal

:: Check if dependencies are already installed
if not exist "node_modules" (
    echo First run detected. Installing dependencies...
    call npm i
    if errorlevel 1 (
        echo Failed to install dependencies.
        goto end
    )
    echo Dependencies installed successfully!
    goto menu
)

:menu
echo Choose an option:
echo 1) Start dev server (npm run dev)
echo 2) Deploy to GitHub Pages (npm run deploy)
echo 3) Run lint and depcheck
set /p choice=Enter your choice [1-3]: 

if "%choice%"=="2" goto deploy
if "%choice%"=="3" goto lint
goto dev

:deploy
echo Deploying to GitHub Pages...
call npm run deploy
if errorlevel 1 (
    echo Deployment failed.
    goto end
)
echo Successfully deployed to GitHub Pages!
echo Opening GitHub Pages site in your default browser...
timeout /t 5 /nobreak
start https://ibrahimahtsham.github.io/freelancer-client-info-grabber/
goto end

:lint
echo Running ESLint...
call npm run lint
echo.
echo Running depcheck...
call npx depcheck
goto end

:dev
echo Starting dev server...
call npm run dev
goto end

:end
endlocal