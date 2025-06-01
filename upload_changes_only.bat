@echo off
echo.
echo === رفع التعديلات الجديدة فقط إلى GitHub ===
echo.

:: الانتقال إلى مجلد المشروع
cd /d "H:\My Drive\kholaidy.com\sites\Awtad-policies"

:: تأكد أن Git مهيأ
IF NOT EXIST ".git" (
    git init
    git remote add origin https://github.com/kholaidy/AwtadPolicies.github.io.git
    git branch -M main
)

:: إضافة التعديلات فقط (الملفات المعدلة والجديدة فقط)
git add .

:: تنفيذ commit إذا كان هناك تغييرات فعلًا
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
