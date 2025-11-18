// js/content-loader.js

function loadPolicyContent(manualCode, contentContainer) {
    console.log('Loading policy content for:', manualCode);

    // Show loading state
    contentContainer.innerHTML = `
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
    `;

    // Fetch the policy file
    fetch(`policies/${manualCode}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            contentContainer.innerHTML = html;

            normalizePolicyHeadings(contentContainer);
            ensureAnchors(contentContainer);
            initializeMermaid(contentContainer);
            addContentSearch(contentContainer);

            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth < 768) {
                sidebar.classList.remove('open');
                const overlay = document.querySelector('.overlay');
                if (overlay) overlay.remove();
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

// Normalize headings across loaded policy content
function normalizePolicyHeadings(contentContainer) {
    const headings = contentContainer.querySelectorAll('.policy-section-title, h2, h3, h4');

    const prefixMap = {
        'gov': 'GOV', 'lgl': 'LGL', 'hr': 'HR', 'fin': 'FIN', 'acc': 'ACC', 'it': 'IT',
        'PMO': 'PMO',
        'proc': 'PROC', 'qaqc': 'QAQC', 'ten': 'TEN', 'am': 'AM', 'cc': 'CC', 'hse': 'HSE',
        'sto': 'STO', 'bdm': 'BDM', 'pem': 'PEM', 'dcc': 'DCC'
    };

    const hasCodeAtStart = (text) => /\s*^[A-Z]{2,5}-\d{3}\b/.test(text);

    headings.forEach(h => {
        const id = h.getAttribute('id');
        if (!id) return;

        const lower = id.toLowerCase();
        let code = null;

        const parts = lower.split(/[-_]/).filter(Boolean);
        if (parts.length >= 2) {
            const maybeDept = parts.find(p => prefixMap[p]);
            const maybeNum = parts.find(p => /^\d{3,}$/.test(p));
            if (maybeDept && maybeNum) {
                code = `${prefixMap[maybeDept]}-${maybeNum.padStart(3, '0')}`;
            }
        }

        if (!code) {
            const m = lower.match(/\b([a-z]{2,5})[-_]?(\d{3,})\b/);
            if (m && prefixMap[m[1]]) {
                code = `${prefixMap[m[1]]}-${m[2].padStart(3, '0')}`;
            }
        }

        if (code) {
            if (h.getAttribute('id') !== code) {
                h.removeAttribute('id');
            }
            const text = (h.textContent || '').trim();
            if (!hasCodeAtStart(text)) {
                h.textContent = `${code}: ${text}`;
            }
        }
    });
}

// Ensure anchor IDs exist based on heading codes
function ensureAnchors(contentContainer) {
    const headings = contentContainer.querySelectorAll('.policy-section-title, h2, h3, h4');
    const codePattern = /\b([A-Z]{2,5}-\d{3})\b/;
    headings.forEach(h => {
        const text = (h.textContent || '').trim();
        const match = text.match(codePattern);
        if (match) {
            const code = match[1];
            if (!h.id) {
                h.id = code;
            }
            const section = h.closest('.policy-section');
            if (section && !section.id) {
                section.id = code;
            }
        }
    });
}

// Function to add content search functionality (MODIFIED FOR AI WIDGET)
function addContentSearch(contentContainer) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-search-wrapper max-w-2xl mx-auto mb-6';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'اسأل المساعد الذكي عن هذه السياسة أو جميع السياسات...';
    searchInput.className = 'w-full px-4 py-3 border border-gray-300 rounded-md text-right text-base ai-search-input';
    searchInput.spellcheck = false;

    wrapper.appendChild(searchInput);
    contentContainer.insertBefore(wrapper, contentContainer.firstChild);
}

// Initialize Mermaid
function initializeMermaid(contentContainer) {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
        mermaid.run({
            nodes: contentContainer.querySelectorAll('.mermaid')
        });
    }
}