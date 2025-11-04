// إضافة هذا الكود في بداية الملف للتأكد من عمل الأزرار
 

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const contentContainer = document.getElementById('content-container');
    const printBtn = document.getElementById('print-btn');
    const sidebarSearch = document.getElementById('sidebar-search');
    
    // --- Helper function for scrolling and highlighting ---
    function scrollToSection(id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight effect
            element.classList.add('highlight');
            
            // Remove highlight after a short delay
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 2500); // Highlight for 2.5 seconds
        } else {
            console.warn('Scroll target not found:', id);
        }
    }

    // Policy Items
    const policyHeaders = document.querySelectorAll('.policy-header');
    const policyItems = document.querySelectorAll('.policy-item, .policy-subitem, .policy-header');

    // إزالة الإلغاء التلقائي للإخفاء؛ نترك الحالة الافتراضية كما هي من HTML
    
    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        
        // Create or remove overlay
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
    
    // Handle clicks on sidebar items using event delegation
    sidebar.addEventListener('click', function(e) {
        const target = e.target.closest('.policy-header, .policy-subitem');
        if (!target) return;

        // السماح بالتوسيع/التقليص على جميع رؤوس السياسات (بما فيها الوثائق)
        if (target.classList.contains('policy-header')) {
            const parent = target.parentElement;
            const children = parent.querySelector('.policy-children');
            if (children) {
                target.classList.toggle('expanded');
                children.classList.toggle('hidden');
            }
        }

        // --- Handle content loading for any item with a data-file attribute ---
        const file = target.getAttribute('data-file');
        if (file) {
            loadPolicyContent(file);
            
            // Set active state
            policyItems.forEach(item => item.classList.remove('active'));
            target.classList.add('active');
        }

        // --- Handle smooth scrolling for items with a data-scroll-to attribute ---
        const scrollToId = target.getAttribute('data-scroll-to');
        if (scrollToId) {
            e.preventDefault(); // Prevent default link behavior

            const parentHeader = target.closest('.policy-item').querySelector('.policy-header[data-file]');
            if (parentHeader) {
                const requiredFile = parentHeader.getAttribute('data-file');
                const isLoaded = contentContainer.querySelector('.policy-content') && document.querySelector('.policy-header.active')?.getAttribute('data-file') === requiredFile;

                if (!isLoaded) {
                    loadPolicyContent(requiredFile, () => {
                        scrollToSection(scrollToId);
                    });
                    policyItems.forEach(item => item.classList.remove('active'));
                    parentHeader.classList.add('active');
                    target.classList.add('active');
                } else {
                    scrollToSection(scrollToId);
                    policyItems.forEach(item => item.classList.remove('active'));
                    parentHeader.classList.add('active');
                    target.classList.add('active');
                }
            }
        }
    });
    
    // Print Button
    printBtn.addEventListener('click', function() {
        // الحصول على الملف الحالي المعروض
        const activeItem = document.querySelector('.policy-item .active, .policy-subitem.active');
        if (!activeItem) {
            alert('الرجاء اختيار قسم من القائمة الجانبية أولاً');
            return;
        }
        
        // محاولة الحصول على data-file من الرأس الأب إذا كان العنصر النشط هو subitem
        let file;
        if (activeItem.hasAttribute('data-file')) {
            file = activeItem.getAttribute('data-file');
        } else {
            const parentHeader = activeItem.closest('.policy-item').querySelector('.policy-header[data-file]');
            if (parentHeader) {
                file = parentHeader.getAttribute('data-file');
            }
        }

        if (!file) {
            alert('لم يتم العثور على محتوى للطباعة');
            return;
        }
        
        // إنشاء نافذة طباعة جديدة
        const printWindow = window.open('', '_blank');
        
        // تحميل المحتوى مباشرة من ملف HTML
        fetch(`policies/${file}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('فشل في تحميل المحتوى');
                }
                return response.text();
            })
            .then(html => {
                // الحصول على عنوان الدليل الرئيسي
                const mainTitleItem = document.querySelector(`.policy-header[data-file="${file}"]`);
                const mainTitle = mainTitleItem ? mainTitleItem.textContent.trim() : 'وثيقة سياسات';

                // إنشاء محتوى HTML للطباعة
                let printContent = `
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>طباعة - شركة أوتاد الفهد</title>
                        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <link rel="stylesheet" href="css/style.css">
                        <style>
                            @media print {
                                body { padding: 20px; }
                                .print-header { margin-bottom: 20px; }
                                @page { size: A4; margin: 1.5cm; }
                            }
                            body {
                                background-color: white;
                                font-family: 'Tahoma', sans-serif; /* استخدام خط شائع للطباعة */
                            }
                            .print-content {
                                max-width: 100%;
                                margin: 0 auto;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-header text-center border-b pb-4 mb-6">
                            <img src="img/logo-large.png" alt="شعار شركة أوتاد الفهد" class="h-20 mx-auto mb-2">
                            <h1 class="text-xl font-bold text-blue-900">بوابة السياسات والإجراءات التشغيلية</h1>
                            <h2 class="text-lg text-gray-700">${mainTitle}</h2>
                        </div>
                        <div class="print-content">
                            ${html}
                        </div>
                        <script>
                            // طباعة تلقائية عند تحميل الصفحة
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                }, 500);
                            }
                        </script>
                    </body>
                    </html>
                `;
                
                // كتابة المحتوى في نافذة الطباعة
                printWindow.document.open();
                printWindow.document.write(printContent);
                printWindow.document.close();
            })
            .catch(error => {
                printWindow.close();
                alert('حدث خطأ أثناء تحميل المحتوى للطباعة: ' + error.message);
            });
    });
    
    // Sidebar Search
    sidebarSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const items = document.querySelectorAll('#policy-tree .policy-item');
    
        items.forEach(item => {
            const header = item.querySelector('.policy-header');
            const childrenList = item.querySelector('.policy-children');
            let itemText = (header.textContent || '').toLowerCase();
            
            let matchesChildren = false;
            
            if (childrenList) {
                const subItems = childrenList.querySelectorAll('.policy-item, .policy-subitem');
                subItems.forEach(subItem => {
                    const subItemText = (subItem.textContent || '').toLowerCase();
                    if (subItemText.includes(searchTerm)) {
                        matchesChildren = true;
                        subItem.style.display = ''; // إظهار العنصر الفرعي المطابق
                    } else {
                        subItem.style.display = 'none'; // إخفاء العنصر الفرعي غير المطابق
                    }
                });
            }
    
            // إذا كان البحث يطابق العنوان الرئيسي أو أحد العناوين الفرعية
            if (itemText.includes(searchTerm) || matchesChildren) {
                item.style.display = ''; // إظهار العنصر الرئيسي
                if (searchTerm.length > 0 && childrenList) {
                    childrenList.classList.remove('hidden'); // فتح القائمة لإظهار النتائج الفرعية
                    header.classList.add('expanded');
                }
            } else {
                item.style.display = 'none'; // إخفاء العنصر الرئيسي
            }
    
            // في حالة مسح البحث، يتم إرجاع العرض ولكن لا يتم إغلاق القوائم المفتوحة
            if (searchTerm === '') {
                item.style.display = '';
                // لا نغير حالة 'hidden' أو 'expanded' هنا
            }
        });
    });
    
    // Function to load policy content
    function loadPolicyContent(file, callback) {
        // Show loading state
        contentContainer.innerHTML = `
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        `;
        
        // Fetch the policy file
        fetch(`policies/${file}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                contentContainer.innerHTML = html;
                
                // Normalize headings: remove manual ids, inject policy codes from id patterns
                normalizePolicyHeadings();

                // Ensure anchors exist for smooth scrolling based on codes like GOV-002
                ensureAnchors();
                
                // Initialize Mermaid for dynamically loaded content
                initializeMermaid();
                
                // Add content search functionality
                addContentSearch();
                
                // Close mobile sidebar after loading content
                if (window.innerWidth < 768) {
                    sidebar.classList.remove('open');
                    const overlay = document.querySelector('.overlay');
                    if (overlay) overlay.remove();
                }

                // If a callback is provided, execute it
                if (typeof callback === 'function') {
                    // Use a small timeout to ensure the DOM is ready
                    setTimeout(callback, 100);
                }
            })
            .catch(error => {
                contentContainer.innerHTML = `
                    <div class="text-center py-12">
                        <div class="bg-red-50 p-4 rounded-lg border border-red-200 text-right max-w-2xl mx-auto">
                            <h3 class="text-xl font-bold text-red-800 mb-2">خطأ في تحميل المحتوى</h3>
                            <p class="text-gray-700 mb-3">
                                لم نتمكن من تحميل المحتوى المطلوب. الرجاء المحاولة مرة أخرى لاحقاً.
                            </p>
                            <p class="text-sm text-gray-500">تفاصيل الخطأ: ${error.message}</p>
                        </div>
                    </div>
                `;
            });
    }

    // Normalize headings across loaded policy content: remove manual ids and inject the correct code into text
    function normalizePolicyHeadings() {
        const headings = contentContainer.querySelectorAll('.policy-section-title, h2, h3, h4');

        // تم تحديث الخريطة لتشمل الأقسام الجديدة
        const prefixMap = {
            'gov': 'GOV', 'lgl': 'LGL', 'hr': 'HR', 'fin': 'FIN', 'acc': 'ACC', 'it': 'IT',
            'pms': 'PMs', // تم تعديل 'PMs' إلى 'pms' للمطابقة
            'proc': 'PROC', 'qaqc': 'QAQC', 'ten': 'TEN', 'am': 'AM', 'cc': 'CC', 'hse': 'HSE',
            'sto': 'STO' // إضافة المخازن
        };

        const hasCodeAtStart = (text) => /\s*^[A-Z]{2,5}-\d{3}\b/.test(text);

        headings.forEach(h => {
            const id = h.getAttribute('id');
            if (!id) return;

            const lower = id.toLowerCase();
            let code = null;

            // Try patterns like "proc-acc-002", "sec-gov-001", "hr-003"
            const parts = lower.split(/[-_]/).filter(Boolean);
            if (parts.length >= 2) {
                // Case 1: <prefix>-<dept>-<num>
                const maybeDept = parts.find(p => prefixMap[p]);
                const maybeNum = parts.find(p => /^\d{3,}$/.test(p));
                if (maybeDept && maybeNum) {
                    code = `${prefixMap[maybeDept]}-${maybeNum.padStart(3, '0')}`;
                }
            }

            // Case 2: id already contains code-like pattern
            if (!code) {
                const m = lower.match(/\b([a-z]{2,5})[-_]?(\d{3,})\b/);
                if (m && prefixMap[m[1]]) {
                    code = `${prefixMap[m[1]]}-${m[2].padStart(3, '0')}`;
                }
            }
            
            if (code) {
                // If the heading ID doesn't match the derived code, remove it
                if (h.getAttribute('id') !== code) {
                    h.removeAttribute('id');
                }
                const text = (h.textContent || '').trim();
                // If text doesn't already start with the code, prepend it
                if (!hasCodeAtStart(text)) {
                    h.textContent = `${code}: ${text}`;
                }
            }
        });
    }
    
    // Ensure anchor IDs exist based on heading codes (e.g., GOV-002, HR-003, etc.)
    function ensureAnchors() {
        const headings = contentContainer.querySelectorAll('.policy-section-title, h2, h3, h4');
        const codePattern = /\b([A-Z]{2,5}-\d{3})\b/;
        headings.forEach(h => {
            const text = (h.textContent || '').trim();
            const match = text.match(codePattern);
            if (match) {
                const code = match[1];
                // الأفضل هو وضع الـ ID على العنوان نفسه لضمان دقة التمرير
                if (!h.id) {
                    h.id = code;
                }
                // وإذا كان العنوان داخل .policy-section، نضع الـ ID عليه أيضاً
                const section = h.closest('.policy-section');
                if (section && !section.id) {
                    section.id = code;
                }
            }
        });
    }
    
    // Function to add content search functionality (MODIFIED FOR AI WIDGET)
    function addContentSearch() {
        // 1. إنشاء الحاوية التي يتوقعها المساعد الذكي
        const wrapper = document.createElement('div');
        // أضفنا تنسيقات لجعله متوافقاً مع تصميم الصفحة الرئيسية
        wrapper.className = 'ai-search-wrapper max-w-2xl mx-auto mb-6';

        // 2. إنشاء مربع الإدخال
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        // تغيير النص التوضيحي ليعكس الوظيفة الجديدة
        searchInput.placeholder = 'اسأل المساعد الذكي عن هذه السياسة أو جميع السياسات...';
        
        // 3. [مهم جداً] إضافة الكلاس الذي يبحث عنه ملف الويدجت
        searchInput.className = 'w-full px-4 py-3 border border-gray-300 rounded-md text-right text-base ai-search-input';
        searchInput.spellcheck = false;

        wrapper.appendChild(searchInput);
        
        // 4. إضافة المربع الجديد في أعلى المحتوى
        contentContainer.insertBefore(wrapper, contentContainer.firstChild);
        
        // 5. [مهم] تم حذف كل الأكواد الخاصة بالبحث والتظليل (highlightText)
        // سيقوم ملف awtad-ai-widget.min.js الآن بالعثور على هذا الإدخال
        // وإضافة زر الطائرة الورقية وربطه بالمساعد تلقائياً.
    }
    
    // (تم حذف دالة highlightText لأنها لم تعد مستخدمة)
    
    // Initialize Mermaid once on page load
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
    }

    // Function to render Mermaid diagrams in dynamically loaded content
    function initializeMermaid() {
        if (typeof mermaid !== 'undefined') {
            // Use mermaid.run() to render any new diagrams
            mermaid.run({
                nodes: contentContainer.querySelectorAll('.mermaid')
            });
        }
    }


    // --- [إضافة جديدة] دالة الربط العميق (Deep Linking) ---
    function handleDeepLink() {
        // 1. احصل على الـ "هاش" من الرابط (مثال: #GOV-002)
        const hash = window.location.hash.substring(1); // (النتيجة: "GOV-002")

        if (!hash) {
            // لا يوجد هاش، لا تفعل شيئاً
            return;
        }

        // 2. ابحث في القائمة الجانبية عن العنصر الذي يشير لهذا الـ "هاش"
        // (نحن نبحث عن data-scroll-to وليس id)
        const targetSubItem = document.querySelector(`.policy-subitem[data-scroll-to="${hash}"]`);

        if (!targetSubItem) {
            console.warn('Deep link target not found in sidebar:', hash);
            return;
        }

        // 3. ابحث عن الملف الأب (data-file) لهذا العنصر
        const parentHeader = targetSubItem.closest('.policy-item').querySelector('.policy-header[data-file]');
        
        if (!parentHeader) {
            console.warn('Parent file for deep link not found:', hash);
            return;
        }

        const fileToLoad = parentHeader.getAttribute('data-file');
        const idToScroll = targetSubItem.getAttribute('data-scroll-to');

        // 4. [مهم] قم بفتح الشجرة (إظهار القوائم المخفية)
        let current = targetSubItem.closest('.policy-children');
        while (current) {
            current.classList.remove('hidden'); // أظهر القائمة الفرعية
            const parentPolicyItem = current.closest('.policy-item');
            if (parentPolicyItem) {
                const header = parentPolicyItem.querySelector('.policy-header');
                if (header) {
                    header.classList.add('expanded'); // أضف سهم التوسيع
                }
                current = parentPolicyItem.closest('.policy-children'); // انتقل للأعلى
            } else {
                current = null;
            }
        }

        // 5. قم بتحميل المحتوى، وعند الانتهاء، قم بالتمرير
        loadPolicyContent(fileToLoad, () => {
            scrollToSection(idToScroll);
        });

        // 6. تفعيل (Highlight) العناصر في القائمة
        document.querySelectorAll('.policy-header, .policy-subitem').forEach(item => item.classList.remove('active'));
        parentHeader.classList.add('active');
        targetSubItem.classList.add('active');
    }

    // --- [إضافة جديدة] ---
    // قم بتشغيل دالة الربط العميق عند تحميل الصفحة
    handleDeepLink();
    // --- نهاية الإضافة ---

}); // نهاية DOMContentLoaded