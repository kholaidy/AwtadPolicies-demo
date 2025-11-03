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
        
        const file = activeItem.getAttribute('data-file');
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
                                font-family: 'Tajawal', sans-serif;
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
                            <h2 class="text-lg text-gray-700">${activeItem.textContent.trim()}</h2>
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
    // داخل document.addEventListener('DOMContentLoaded', function() { ... })
    sidebarSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        // ... existing code ...
        if (searchTerm === '') {
            // إعادة إظهار العناصر فقط دون تعديل حالات التوسيع/التقليص
            policyItems.forEach(item => {
                item.style.display = '';
            });
        }
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

        const prefixMap = {
            'gov': 'GOV', 'lgl': 'LGL', 'hr': 'HR', 'fin': 'FIN', 'acc': 'ACC', 'it': 'IT',
            'pmo': 'PMO', 'proc': 'PROC', 'qaqc': 'QAQC', 'ten': 'TEN', 'am': 'AM', 'cc': 'CC', 'hse': 'HSE'
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

            // ========= START MODIFIED SECTION =========
            // If we derived a code, inject code into heading text if missing
            if (code) {
                // Only remove the ID if it's "bad" (doesn't match the code)
                if (h.getAttribute('id') !== code) {
                    h.removeAttribute('id');
                }
                const text = (h.textContent || '').trim();
                if (!/^\s*[A-Z]{2,5}-\d{3}\b/.test(text)) {
                    h.textContent = `${code}: ${text}`;
                }
            }
            // ========= END MODIFIED SECTION =========
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
                const section = h.closest('.policy-section') || h;
                if (!section.id) {
                    section.id = code;
                }
            }
        });
    }
    
    // Function to add content search functionality
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
    
    // Function to highlight text
    function highlightText(element, searchTerm) {
        if (element.nodeType === 3) { // Text node
            const text = element.nodeValue;
            const lowerText = text.toLowerCase();
            let position = lowerText.indexOf(searchTerm);
            
            if (position !== -1) {
                const spanNode = document.createElement('span');
                const middleNode = document.createTextNode(text.substring(position, position + searchTerm.length));
                const markNode = document.createElement('mark');
                markNode.classList.add('bg-yellow-200');
                markNode.appendChild(middleNode);
                
                const afterNode = document.createTextNode(text.substring(position + searchTerm.length));
                spanNode.appendChild(document.createTextNode(text.substring(0, position)));
                spanNode.appendChild(markNode);
                spanNode.appendChild(afterNode);
                
                element.parentNode.replaceChild(spanNode, element);
                return 1;
            }
            return 0;
        } else if (element.nodeType === 1) { // Element node
            // Skip search input itself and script tags
            if (element.tagName === 'INPUT' || element.tagName === 'SCRIPT') {
                return 0;
            }
            
            let count = 0;
            const childNodes = Array.from(element.childNodes);
            for (let i = 0; i < childNodes.length; i++) {
                count += highlightText(childNodes[i], searchTerm);
            }
            return count;
        }
        return 0;
    }
    
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
});