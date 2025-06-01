@echo off
echo.
echo === رفع موقع AwtadPolicies إلى GitHub Pages ===
echo.

:: الانتقال إلى مجلد الموقع
cd /d "H:\My Drive\kholaidy.com\sites\Awtad-policies"

:: تهيئة Git فقط إذا لم يتم مسبقًا (يتم تخطيها إن كانت موجودة)
IF NOT EXIST ".git" (
    git init
    git remote add origin https://github.com/kholaidy/AwtadPolicies.github.io.git
    git branch -M main
)

:: إضافة الملفات
git add .

:: عمل commit
git commit -m "تحديث تلقائي للموقع" || echo (لا يوجد تغيير جديد)

:: رفع الملفات واستبدال الموجود في GitHub
git push -f origin main

echo.
echo ✅ تم رفع الموقع بنجاح!
pause
