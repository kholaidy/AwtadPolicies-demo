// js/main.js

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Scroll to a section and highlight it
 * @param {string} id - Element ID to scroll to
 */
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn('Scroll target not found:', id);
        return;
    }

    const rect = element.getBoundingClientRect();
    const isVisible = (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );

    // Scroll only if element is not fully visible
    if (!isVisible) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Always highlight
    element.classList.add('highlight');
    setTimeout(() => element.classList.remove('highlight'), 1500);
}

// =============================================================================
// DOM READY - MAIN INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Get main elements
    const treeRoot = document.getElementById('tree-root');
    const contentContainer = document.getElementById('content-container');
    const sidebar = document.getElementById('sidebar');
    const sidebarSearch = document.getElementById('sidebar-search');

    // Validate critical elements
    if (!treeRoot || !contentContainer) {
        console.error('Critical elements not found: tree-root or content-container');
        return;
    }

    // Build navigation tree
    buildTree(treeRoot, classificationData);

    // Initialize features
    initializeMobileMenu(sidebar);
    initializeDropdownMenu();
    initializeActionButtons();
    initializeSearch(sidebarSearch);
    initializePrint();
    handleDeepLink(contentContainer);
});

// =============================================================================
// MOBILE MENU (Sidebar Toggle)
// =============================================================================

function initializeMobileMenu(sidebar) {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (!mobileMenuBtn) return;

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        toggleOverlay(sidebar.classList.contains('open'));
    });
}

function toggleOverlay(show) {
    let overlay = document.querySelector('.overlay');

    if (show) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('open');
                overlay.remove();
            });
        }
    } else {
        if (overlay) overlay.remove();
    }
}

// =============================================================================
// ACTION BUTTONS (Desktop & Tablet)
// =============================================================================

function initializeActionButtons() {
    // Desktop buttons
    connectButton('print-btn-desktop', 'print-btn');
    connectButton('print-all-btn-desktop', 'print-all-btn');
    connectButton('edit-toggle-btn-desktop', 'edit-toggle-btn');

    // Tablet buttons
    connectButton('print-btn-tablet', 'print-btn');
    connectButton('print-all-btn-tablet', 'print-all-btn');
    connectButton('edit-toggle-btn-tablet', 'edit-toggle-btn');
}

function connectButton(visibleBtnId, mainBtnId) {
    const visibleBtn = document.getElementById(visibleBtnId);
    const mainBtn = document.getElementById(mainBtnId);

    if (visibleBtn && mainBtn) {
        visibleBtn.addEventListener('click', () => mainBtn.click());
    }
}

// =============================================================================
// DROPDOWN MENU (Mobile Actions)
// =============================================================================

function initializeDropdownMenu() {
    const dropdownBtn = document.getElementById('dropdown-menu-btn');
    const dropdownMenu = document.getElementById('header-dropdown');

    if (!dropdownBtn || !dropdownMenu) return;

    // Toggle dropdown
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.classList.contains('hidden') && 
            !dropdownMenu.contains(e.target) && 
            e.target !== dropdownBtn) {
            dropdownMenu.classList.add('hidden');
        }
    });

    // Connect mobile buttons to desktop button actions
    connectMobileButtons(dropdownMenu);
}

function connectMobileButtons(dropdownMenu) {
    const buttonMappings = [
        { mobile: 'print-btn-mobile', desktop: 'print-btn' },
        { mobile: 'print-all-btn-mobile', desktop: 'print-all-btn' },
        { mobile: 'edit-toggle-btn-mobile', desktop: 'edit-toggle-btn' }
    ];

    buttonMappings.forEach(({ mobile, desktop }) => {
        const mobileBtn = document.getElementById(mobile);
        const desktopBtn = document.getElementById(desktop);

        if (mobileBtn && desktopBtn) {
            mobileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                desktopBtn.click();
                dropdownMenu.classList.add('hidden');
            });
        }
    });
}

// =============================================================================
// SEARCH FUNCTIONALITY
// =============================================================================

function initializeSearch(searchInput) {
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const domainItems = document.querySelectorAll('.domain-item');

        domainItems.forEach(item => {
            const result = searchInDomain(item, searchTerm);
            item.style.display = result.hasMatch ? '' : 'none';
        });

        // Reset state when search is cleared
        if (searchTerm === '') {
            resetExpandedState();
        }
    });
}

function searchInDomain(domainItem, searchTerm) {
    const domainHeader = domainItem.querySelector('.domain-header');
    const manualsContainer = domainItem.querySelector('.manuals-container');
    
    const domainMatches = domainHeader.textContent.toLowerCase().includes(searchTerm);
    let hasVisibleChildren = false;

    if (manualsContainer) {
        const manualItems = manualsContainer.querySelectorAll('.manual-item');
        
        manualItems.forEach(manualItem => {
            const result = searchInManual(manualItem, searchTerm);
            manualItem.style.display = result.hasMatch ? '' : 'none';
            
            if (result.hasMatch) {
                hasVisibleChildren = true;
            }
        });
    }

    // Expand if searching and has results
    if (searchTerm.length > 0 && (domainMatches || hasVisibleChildren)) {
        domainHeader.classList.add('expanded');
        if (manualsContainer) manualsContainer.classList.remove('hidden');
    }

    return { hasMatch: domainMatches || hasVisibleChildren };
}

function searchInManual(manualItem, searchTerm) {
    const manualHeader = manualItem.querySelector('.manual-header');
    const policiesContainer = manualItem.querySelector('.policies-container');
    
    const manualMatches = manualHeader.textContent.toLowerCase().includes(searchTerm);
    let hasVisiblePolicies = false;

    if (policiesContainer) {
        const policyItems = policiesContainer.querySelectorAll('.policy-item');
        
        policyItems.forEach(policyItem => {
            const matches = policyItem.textContent.toLowerCase().includes(searchTerm);
            policyItem.style.display = matches ? '' : 'none';
            
            if (matches) hasVisiblePolicies = true;
        });
    }

    // Expand if searching and has results
    if (searchTerm.length > 0 && (manualMatches || hasVisiblePolicies)) {
        manualHeader.classList.add('expanded');
        if (policiesContainer) policiesContainer.classList.remove('hidden');
    }

    return { hasMatch: manualMatches || hasVisiblePolicies };
}

function resetExpandedState() {
    document.querySelectorAll('.expanded').forEach(el => el.classList.remove('expanded'));
    document.querySelectorAll('.manuals-container, .policies-container').forEach(el => {
        el.classList.add('hidden');
    });
}

// =============================================================================
// DEEP LINKING
// =============================================================================

function handleDeepLink(contentContainer) {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const targetSubItem = document.querySelector(`.policy-item[data-policy-code="${hash}"]`);
    if (!targetSubItem) return;

    const manualItem = targetSubItem.closest('.manual-item');
    if (!manualItem) return;

    const manualHeader = manualItem.querySelector('.manual-header');
    if (!manualHeader) return;

    // Expand all parent domains
    expandParentDomains(manualItem);

    // Expand the manual
    manualHeader.classList.add('expanded');
    const policiesContainer = manualItem.querySelector('.policies-container');
    if (policiesContainer) {
        policiesContainer.classList.remove('hidden');
    }

    // Load content
    const fileToLoad = manualHeader.dataset.manualCode;
    loadPolicyContent(fileToLoad, contentContainer, hash);

    // Set active states
    document.querySelectorAll('.manual-header.active, .policy-item.active')
        .forEach(item => item.classList.remove('active'));
    manualHeader.classList.add('active');
    targetSubItem.classList.add('active');
}

function expandParentDomains(element) {
    let parent = element.closest('.domain-item');
    
    while (parent) {
        const header = parent.querySelector('.domain-header');
        const container = parent.querySelector('.manuals-container');
        
        if (header && container) {
            header.classList.add('expanded');
            container.classList.remove('hidden');
        }
        
        parent = parent.parentElement.closest('.domain-item');
    }
}

// =============================================================================
// PRINT FUNCTIONALITY
// =============================================================================

function initializePrint() {
    const printBtn = document.getElementById('print-btn');
    if (!printBtn) return;

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

        printManual(activeManual, manualCode);
    });
}

function printManual(activeManual, manualCode) {
    const printWindow = window.open('', '_blank');

    fetch(`policies/${manualCode}.html`)
        .then(response => {
            if (!response.ok) throw new Error('فشل في تحميل المحتوى');
            return response.text();
        })
        .then(html => {
            const mainTitle = activeManual.querySelector('.manual-name strong').textContent.trim();
            const printContent = generatePrintHTML(mainTitle, html);
            
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();
        })
        .catch(error => {
            if (printWindow) printWindow.close();
            alert('حدث خطأ أثناء تحميل المحتوى للطباعة: ' + error.message);
        });
}

function generatePrintHTML(title, content) {
    return `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>طباعة - ${title}</title>
            <link rel="stylesheet" href="css/style.css">
            <style>
                @media print {
                    body { font-size: 10pt; }
                    .print-header { 
                        display: block; 
                        text-align: center; 
                        border-bottom: 1px solid #ccc; 
                        padding-bottom: 15px; 
                        margin-bottom: 20px; 
                    }
                    @page { size: A4; margin: 1.5cm; }
                }
                body { background-color: white; }
            </style>
        </head>
        <body>
            <div class="print-header">
                <img src="img/logo-large.png" alt="شعار شركة أوتاد الفهد" style="height: 60px; margin: 0 auto 10px;">
                <h1>بوابة السياسات والإجراءات التشغيلية</h1>
                <h2>${title}</h2>
            </div>
            <div class="print-content">${content}</div>
            <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"><\/script>
            <script>
                window.onload = function() {
                    mermaid.initialize({ startOnLoad: false, theme: 'default' });
                    mermaid.run({
                        nodes: document.querySelectorAll('.mermaid')
                    }).then(() => {
                        setTimeout(() => window.print(), 300);
                    });
                };
            <\/script>
        </body>
        </html>
    `;
}