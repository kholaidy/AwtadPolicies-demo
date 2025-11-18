// js/print-all.js
// هذا الملف يحتوي على الكود الخاص بوظيفة "طباعة كل الوثائق" مع ضمان رسم Mermaid

document.addEventListener('DOMContentLoaded', () => {
    const printAllBtn = document.getElementById('print-all-btn');

    if (!printAllBtn) {
        return; // لا تفعل شيئاً إذا لم يكن الزر موجوداً
    }

    printAllBtn.addEventListener('click', async () => {
        // 1. إظهار حالة التحميل للمستخدم
        const originalText = printAllBtn.innerHTML;
        printAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-1"></i> جاري التجهيز...';
        printAllBtn.disabled = true;

        // 2. تجميع قائمة بكل الأدلة المراد طباعتها
        const manualsToPrint = [];
        if (typeof classificationData === 'undefined') {
            alert('خطأ: بيانات الفهرس (classificationData) غير متاحة.');
            printAllBtn.innerHTML = originalText;
            printAllBtn.disabled = false;
            return;
        }
        
        Object.values(classificationData).forEach(domain => {
            Object.entries(domain.manuals).forEach(([manualName, manualData]) => {
                manualsToPrint.push({
                    code: manualData.code,
                    name: manualName
                });
            });
        });

        // 3. جلب محتوى كل ملفات HTML باستخدام Promise.all
        try {
            const fetchPromises = manualsToPrint.map(manual =>
                fetch(`policies/${manual.code}.html`)
                .then(response => {
                    if (!response.ok) throw new Error(`فشل تحميل ${manual.code}`);
                    return response.text();
                })
                .then(html => ({ name: manual.name, html: html })) // إرجاع كائن يحتوي على الاسم والمحتوى
                .catch(error => ({ name: manual.name, html: `<div style="color:red;"><h2>خطأ في تحميل ${manual.name}</h2></div>` }))
            );

            const results = await Promise.all(fetchPromises);

            // 4. تجميع المحتوى في صفحة HTML واحدة مع فواصل صفحات
            const combinedHtml = results.map(result => `
                <div class="manual-section">
                    <h1 class="manual-title-print">${result.name}</h1>
                    ${result.html}
                </div>
            `).join('');

            // 5. فتح نافذة الطباعة بالمحتوى المجمع والسكريبتات اللازمة
            openPrintWindowForAll(combinedHtml);

        } catch (error) {
            alert('حدث خطأ فادح أثناء تجهيز الملفات للطباعة: ' + error.message);
        } finally {
            // 6. إعادة الزر لحالته الطبيعية
            printAllBtn.innerHTML = originalText;
            printAllBtn.disabled = false;
        }
    });

    function openPrintWindowForAll(content) {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>طباعة كافة السياسات - شركة أوتاد الفهد</title>
                <link rel="stylesheet" href="css/style.css">
                <style>
                    @media print {
                        body { font-size: 10pt; }
                        .print-header { display: block; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 20px; }
                        .manual-section { page-break-before: always; }
                        .manual-section:first-child { page-break-before: auto; }
                        .manual-title-print { font-size: 1.8rem; font-weight: bold; text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }
                        @page { size: A4; margin: 1.5cm; }
                    }
                    body { background-color: white; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <img src="img/logo-large.png" alt="شعار شركة أوتاد الفهد" style="height: 60px; margin: 0 auto 10px;">
                    <h1>بوابة السياسات والإجراءات التشغيلية (نسخة شاملة)</h1>
                </div>
                <div class="print-content">
                    ${content}
                </div>
                
                <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"><\/script>
                <script>
                    window.onload = function() {
                        mermaid.initialize({ startOnLoad: false, theme: 'default' });
                        mermaid.run({
                            nodes: document.querySelectorAll('.mermaid')
                        }).then(() => {
                            setTimeout(() => {
                                window.print();
                            }, 300);
                        });
                    };
                <\/script> 
            </body>
            </html>
        `;
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
});