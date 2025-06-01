@echo off

:: bush_updated.bat - رفع واستبدال كامل للمستودع AwtadPolicies-demo

echo.
echo === رفع الموقع واستبدال الملفات القديمة على فرع main ===
echo.

cd /d "H:\My Drive\kholaidy.com\sites\Awtad-policies"

IF NOT EXIST ".git" (
    git init
    git remote add origin https://github.com/kholaidy/AwtadPolicies-demo.git
)

git checkout -B main
git add -A
git commit -m "استبدال كامل لمحتوى الموقع"
git push -f origin main

echo.
echo ✅ تم رفع الموقع واستبدال كل الملفات بنجاح.
pause
