@echo off

echo.
echo === Upload New Changes Only to GitHub ===
echo.

cd /d "H:\My Drive\sites\AwtadPolicies.kholaidy.com\client"

IF NOT EXIST ".git" (
    git init
    git remote add origin https://github.com/kholaidy/AwtadPolicies-demo.git
    git branch -M main
)

git add .
git diff --cached --quiet
IF ERRORLEVEL 1 (
    git commit -m "Upload new changes only"
    git push origin main
    echo.
    echo Successfully uploaded modified files only.
) ELSE (
    echo.
    echo Warning: No new changes to upload.
)

pause