# Awtad AI Policy Assistant Widget
الحل: إليك التعديلات الدقيقة لإصلاح كل شيء
سنقوم بإجراء تعديلين بسيطين في ملفي main.js و tree-builder.js.
الخطوة 1: إصلاح ملف main.js (جعل الدالة عامة)
افتح ملف js/main.js وقم بنقل دالة scrollToSection بأكملها لتكون خارج DOMContentLoaded.
استبدل محتوى ملف main.js بالكامل بهذا الكود المصحح:
code
JavaScript
// js/main.js

// --- [ الخطوة 1: جعل الدالة عامة ] ---
// تم نقل الدالة إلى هنا لتكون مرئية لجميع الملفات
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const rect = element.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );

        if (!isVisible) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        element.classList.add('highlight');
        setTimeout(() => {
            element.classList.remove('highlight');
        }, 1500);
    } else {
        console.warn('Scroll target not found:', id);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const treeRoot = document.getElementById('tree-root');
    const contentContainer = document.getElementById('content-container');

    if (!treeRoot || !contentContainer) {
        console.error("خطأ: لم يتم العثور على الحاوية tree-root أو content-container.");
        return;
    }

    buildTree(treeRoot, classificationData, (manualCode) => {
        loadPolicyContent(manualCode, contentContainer);
    });

    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const printBtn = document.getElementById('print-btn');
    const sidebarSearch = document.getElementById('sidebar-search');

    // --- تم نقل دالة scrollToSection من هنا ---

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open')) {
            const overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('open');
                overlay.remove();
            });
        } else {
            const overlay = document.querySelector('.overlay');
            if (overlay) overlay.remove();
        }
    });

    // --- (بقية الكود يبقى كما هو بدون تغيير) ---
    // ... دالة handleDeepLink ...
    // ... دالة sidebarSearch ...
    // ... دالة printBtn ...
    
    // --- دالة الربط العميق ---
    function handleDeepLink() {
        const hash = window.location.hash.substring(1);

        if (!hash) {
            return;
        }

        const targetSubItem = document.querySelector(`.policy-item[data-policy-code="${hash}"]`);

        if (!targetSubItem) {
            console.warn('Deep link target not found:', hash);
            return;
        }

        const manualHeader = targetSubItem.closest('.manual-item').querySelector('.manual-header');

        if (!manualHeader) {
            console.warn('Parent file for deep link not found:', hash);
            return;
        }

        const domainItem = targetSubItem.closest('.domain-item');

        let current = targetSubItem.closest('.manuals-container');
        while (current) {
            current.classList.remove('hidden');
            const parentDomainItem = current.closest('.domain-item');
             if (parentDomainItem) {
                const header = parentDomainItem.querySelector('.domain-header');
                if (header) {
                    header.classList.add('expanded');
                }
               current = parentDomainItem.closest('.manuals-container');
            } else {
                current = null;
            }
        }
        
        manualHeader.closest('.manual-item').querySelector('.policies-container').classList.remove('hidden')
        manualHeader.classList.add('expanded')
        
        const fileToLoad = manualHeader.dataset.manualCode;
        loadPolicyContent(fileToLoad, contentContainer, hash); // تعديل بسيط هنا لاستخدام الهايلايت عند الربط العميق

        document.querySelectorAll('.domain-header, .manual-header, .policy-item').forEach(item => item.classList.remove('active'));
        manualHeader.classList.add('active');
        targetSubItem.classList.add('active');
    }
    
    handleDeepLink();

    // Sidebar Search
    sidebarSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const items = document.querySelectorAll('.domain-item');

        items.forEach(item => {
            const domainHeader = item.querySelector('.domain-header');
            const manualsContainer = item.querySelector('.manuals-container');
            let itemText = (domainHeader.textContent || '').toLowerCase();

            let matchesManuals = false;

            if (manualsContainer) {
                const manualItems = manualsContainer.querySelectorAll('.manual-item');
                manualItems.forEach(manualItem => {
                    const manualHeader = manualItem.querySelector('.manual-header');
                    const policiesContainer = manualItem.querySelector('.policies-container');
                    let manualText = (manualHeader.textContent || '').toLowerCase();
                    let matchesPolicies = false;

                    if (policiesContainer) {
                        const policyItems = policiesContainer.querySelectorAll('.policy-item');
                        policyItems.forEach(policyItem => {
                            const policyText = (policyItem.textContent || '').toLowerCase();
                            if (policyText.includes(searchTerm)) {
                                matchesPolicies = true;
                                policyItem.style.display = '';
                            } else {
                                policyItem.style.display = 'none';
                            }
                        });
                    }

                    if (manualText.includes(searchTerm) || matchesPolicies) {
                        matchesManuals = true;
                        manualItem.style.display = '';
                        if (searchTerm.length > 0 && policiesContainer) {
                            policiesContainer.classList.remove('hidden');
                            manualHeader.classList.add('expanded');
                        }
                    } else {
                        manualItem.style.display = 'none';
                    }
                });
            }

            if (itemText.includes(searchTerm) || matchesManuals) {
                item.style.display = '';
                if (searchTerm.length > 0 && manualsContainer) {
                    manualsContainer.classList.remove('hidden');
                    domainHeader.classList.add('expanded');
                }
            } else {
                item.style.display = 'none';
            }

            if (searchTerm === '') {
                item.style.display = '';
                if (manualsContainer) {
                     manualsContainer.classList.add('hidden');
                }
            }
        });
    });

    // --- [ زر الطباعة - النسخة المعدلة ] ---
    printBtn.addEventListener('click', function() {
        const activeManual = document.querySelector('.manual-header.active');
        if (!activeManual) {
            alert('الرجاء اختيار دليل من القائمة الجانبية أولاً');
            return;
        }

        const manualCode = activeManual.dataset.manualCode;
        if (!manualCode) {
            alert('لم يتم العثور على رمز الدليل');
            return;
        }

        const printWindow = window.open('', '_blank');

        fetch(`policies/${manualCode}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('فشل في تحميل المحتوى');
                }
                return response.text();
            })
            .then(html => {
                const mainTitle = activeManual.querySelector('.manual-name strong').textContent.trim();
                let printContent = `
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <title>طباعة - ${mainTitle}</title>
                        <link rel="stylesheet" href="css/style.css">
                        <style>
                            @media print {
                                body { font-size: 10pt; padding: 1cm; }
                                .print-header { display: block; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 20px; }
                                .print-header img { height: 60px; margin: 0 auto 10px; }
                                @page { size: A4; margin: 1.5cm; }
                            }
                            body { background-color: white; }
                        </style>
                    </head>
                    <body>
                        <div class="print-header">
                            <img src="img/logo-large.png" alt="شعار شركة أوتاد الفهد">
                            <h1>بوابة السياسات والإجراءات التشغيلية</h1>
                            <h2>${mainTitle}</h2>
                        </div>
                        <div class="print-content">
                            ${html}
                        </div>
                        <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"><\/script>
                        <script>
                            window.onload = function() {
                                mermaid.initialize({ startOnLoad: false, theme: 'default' });
                                mermaid.run({
                                    nodes: document.querySelectorAll('.mermaid')
                                }).then(() => {
                                    setTimeout(function() {
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
            })
            .catch(error => {
                printWindow.close();
                alert('حدث خطأ أثناء تحميل المحتوى للطباعة: ' + error.message);
            });
    });
});
الخطوة 2: إصلاح ملف tree-builder.js (إصلاح استدعاء الدالة)
افتح ملف js/tree-builder.js وقم بتعديل بسيط جداً على معالج الحدث الخاص بـ manualHeader.
ابحث عن هذا الكود:
code
JavaScript
manualHeader.addEventListener('click', (e) => {
                // ...
                // Load content
                loadPolicyContent(manualData.code); // <-- هذا السطر هو سبب الخطأ الرئيسي
            });
واستبدله بهذا الكود المصحح:
code
JavaScript
manualHeader.addEventListener('click', (e) => {
                e.stopPropagation();

                policiesContainer.classList.toggle('hidden');
                manualHeader.classList.toggle('expanded');
                
                document.querySelectorAll('.manual-header').forEach(h => h.classList.remove('active'));
                manualHeader.classList.add('active');

                // --- [ هذا هو الإصلاح ] ---
                // عند النقر على الدليل، قم بتحميل محتواه بدون طلب انتقال
                loadPolicyContent(manualData.code, document.getElementById('content-container'));
            });
لماذا هذا الإصلاح؟
لقد قمنا بتمرير الوسيط الثاني المطلوب document.getElementById('content-container') إلى دالة loadPolicyContent، مما يمنع حدوث الخطأ.
عند النقر على الدليل نفسه (وليس سياسة فرعية)، لا نحتاج للانتقال إلى قسم معين، لذلك لا نمرر الوسيط الثالث، وستعمل الدالة بشكل صحيح.