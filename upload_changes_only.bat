@echo off

echo.
echo === رفع التعديلات الجديدة فقط إلى GitHub ===
echo.

cd /d "H:\My Drive\kholaidy.com\sites\AwtadPolicies.kholaidy.com"

IF NOT EXIST ".git" (
    git init
    git remote add origin https://github.com/kholaidy/AwtadPolicies-demo.git
    git branch -M main
)

git add .
git diff --cached --quiet
IF ERRORLEVEL 1 (
    git commit -m "رفع تعديلات جديدة فقط"
    git push origin main
    echo.
    echo ✅ تم رفع الملفات التي تم تعديلها فقط.
) ELSE (
    echo.
    echo ⚠️ لا يوجد أي تعديل جديد لرفعه.
)

pause