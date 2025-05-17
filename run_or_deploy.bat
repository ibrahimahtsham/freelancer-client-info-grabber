:: filepath: c:\Users\Siamax\Desktop\freelancer-client-info-grabber\run_or_deploy.bat
@echo off
setlocal

echo Choose an option:
echo 1) Start dev server (npm run dev)
echo 2) Deploy to GitHub Pages (build & push to gh-pages branch)
echo 3) Run lint and depcheck
set /p choice=Enter your choice [1-3]: 

if "%choice%"=="2" goto deploy
if "%choice%"=="3" goto lint
goto dev

:deploy
echo Building project for production...
npm run build
if errorlevel 1 (
    echo Build failed.
    goto end
)

:: Create temporary worktree folder
set "TMP_WORKTREE=%TEMP%\tmp_%RANDOM%"
mkdir "%TMP_WORKTREE%"

:: Add worktree: try first, if fails then use -B
git worktree add "%TMP_WORKTREE%" gh-pages
if errorlevel 1 (
    git worktree add -B gh-pages "%TMP_WORKTREE%" origin/gh-pages
)

:: Remove current contents from the temporary worktree
for /d %%i in ("%TMP_WORKTREE%\*") do rd /s /q "%%i"
del /q "%TMP_WORKTREE%\*" 2>nul

echo Copying build files to worktree...
xcopy /E /I /Y dist "%TMP_WORKTREE%"

pushd "%TMP_WORKTREE%"
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
popd

git worktree remove "%TMP_WORKTREE%"
echo Deployed to GitHub Pages!
goto end

:lint
echo Running ESLint...
npm run lint
echo Running depcheck...
npx depcheck
goto end

:dev
echo Starting dev server...
npm run dev
goto end

:end
endlocal