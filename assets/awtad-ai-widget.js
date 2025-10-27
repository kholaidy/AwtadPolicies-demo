/**
 * Awtad AI Policy Assistant Widget
 * Version: 1.0.0
 * Author: Kholaidy
 * A single-file, dependency-free JS widget to assist with policy documents.
 */
(function () {
    'use strict';

    // --- CONFIGURATION ---
    const SCRIPT_TAG = document.currentScript;
    const CONFIG = {
        endpoint: SCRIPT_TAG?.dataset.endpoint || window.AWTAD_AI_ENDPOINT || 'https://awtad-policies-ai.kholaidy.workers.dev/api/policies-ai',
        title: SCRIPT_TAG?.dataset.title || '🤖 مساعد السياسات الذكي',
        welcomeMessage: SCRIPT_TAG?.dataset.welcome || 'ألصق نص السياسة هنا… أو اتركني أقرأ الصفحة.',
        lang: SCRIPT_TAG?.dataset.lang || 'ar',
        maxTextLength: 14000, // Max characters to send to API
        maxPageReadLength: 12000, // Max characters to read from the page
        localStorageKey: 'awtad_ai_buffer',
    };

    let isFetching = false;
    let debounceTimer;

    // --- UI & STYLE INJECTION ---
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --awtad-ai-primary: #007bff;
                --awtad-ai-primary-hover: #0056b3;
                --awtad-ai-bg: #fff;
                --awtad-ai-text: #212529;
                --awtad-ai-border: #dee2e6;
                --awtad-ai-header-bg: #f8f9fa;
                --awtad-ai-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
                --awtad-ai-btn-secondary-bg: #6c757d;
                --awtad-ai-btn-secondary-hover: #5a6268;
                --awtad-ai-error: #dc3545;
                --awtad-ai-success: #28a745;
            }
            @media (prefers-color-scheme: dark) {
                :root {
                    --awtad-ai-primary: #0d6efd;
                    --awtad-ai-primary-hover: #0b5ed7;
                    --awtad-ai-bg: #212529;
                    --awtad-ai-text: #f8f9fa;
                    --awtad-ai-border: #495057;
                    --awtad-ai-header-bg: #343a40;
                    --awtad-ai-shadow: 0 .5rem 1rem rgba(255,255,255,.05);
                    --awtad-ai-btn-secondary-bg: #495057;
                    --awtad-ai-btn-secondary-hover: #5c636a;
                }
            }
            .awtad-ai-widget-button {
                cursor: pointer;
                padding: 5px 10px;
                border: 1px solid var(--awtad-ai-primary);
                background-color: transparent;
                color: var(--awtad-ai-primary);
                border-radius: 5px;
                font-size: 14px;
                margin: 0 5px;
                transition: all 0.2s ease-in-out;
            }
            .awtad-ai-widget-button:hover {
                background-color: var(--awtad-ai-primary);
                color: var(--awtad-ai-bg);
            }
            .awtad-ai-modal-overlay {
                position: fixed; z-index: 9998; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
            }
            .awtad-ai-modal {
                direction: rtl; position: fixed; z-index: 9999; background: var(--awtad-ai-bg); color: var(--awtad-ai-text); border-radius: 8px; box-shadow: var(--awtad-ai-shadow); width: 90%; max-width: 600px; display: flex; flex-direction: column; top: 50%; left: 50%; transform: translate(-50%, -50%);
            }
            .awtad-ai-modal-header {
                padding: 10px 15px; background: var(--awtad-ai-header-bg); border-bottom: 1px solid var(--awtad-ai-border); cursor: move; border-top-left-radius: 8px; border-top-right-radius: 8px; display: flex; justify-content: space-between; align-items: center;
            }
            .awtad-ai-modal-body {
                padding: 15px; flex-grow: 1; display: flex; flex-direction: column; gap: 10px;
            }
            .awtad-ai-modal-textarea {
                width: 100%; height: 150px; padding: 10px; border: 1px solid var(--awtad-ai-border); border-radius: 5px; background: var(--awtad-ai-bg); color: var(--awtad-ai-text); resize: vertical;
            }
            .awtad-ai-modal-result {
                flex-grow: 1; border: 1px solid var(--awtad-ai-border); border-radius: 5px; padding: 10px; min-height: 100px; overflow-y: auto; background-color: var(--awtad-ai-header-bg);
            }
            .awtad-ai-modal-footer {
                padding: 10px 15px; border-top: 1px solid var(--awtad-ai-border); display: flex; flex-wrap: wrap; gap: 5px; justify-content: flex-start;
            }
            .awtad-ai-modal-btn {
                cursor: pointer; padding: 8px 12px; border-radius: 5px; border: none; font-size: 14px; transition: background-color 0.2s;
            }
            .awtad-ai-btn-action { background-color: var(--awtad-ai-primary); color: white; }
            .awtad-ai-btn-action:hover:not(:disabled) { background-color: var(--awtad-ai-primary-hover); }
            .awtad-ai-btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
            .awtad-ai-btn-secondary { background-color: var(--awtad-ai-btn-secondary-bg); color: white; }
            .awtad-ai-btn-secondary:hover { background-color: var(--awtad-ai-btn-secondary-hover); }
            .awtad-ai-status {
                font-size: 12px; margin-top: 5px; text-align: center;
            }
            .awtad-ai-status.error { color: var(--awtad-ai-error); }
            .awtad-ai-status.loading::after {
                content: '...';
                display: inline-block;
                animation: awtad-ai-ellipsis 1.2s infinite;
            }
            @keyframes awtad-ai-ellipsis { 0%, 20% { content: '.'; } 40% { content: '..'; } 60%, 100% { content: '...'; } }
        `;
        document.head.appendChild(style);
    }

    function createModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'awtad-ai-modal-overlay';
        modalOverlay.style.display = 'none';

        const modal = document.createElement('div');
        modal.className = 'awtad-ai-modal';

        modal.innerHTML = `
            <div class="awtad-ai-modal-header">
                <span>${CONFIG.title}</span>
                <button class="awtad-ai-modal-btn awtad-ai-btn-secondary" data-action="close">&times;</button>
            </div>
            <div class="awtad-ai-modal-body">
                <textarea class="awtad-ai-modal-textarea" placeholder="${CONFIG.welcomeMessage}"></textarea>
                <div class="awtad-ai-modal-result" aria-live="polite"></div>
                <div class="awtad-ai-status"></div>
            </div>
            <div class="awtad-ai-modal-footer">
                <button class="awtad-ai-modal-btn awtad-ai-btn-action" data-action="improve">حسّن السياسة</button>
                <button class="awtad-ai-modal-btn awtad-ai-btn-action" data-action="compliance">فحص الالتزام</button>
                <button class="awtad-ai-modal-btn awtad-ai-btn-action" data-action="new">إنشاء سياسة جديدة</button>
                <button class="awtad-ai-modal-btn awtad-ai-btn-secondary" data-action="copy">نسخ</button>
            </div>
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // --- Event Listeners & Logic ---
        const textarea = modal.querySelector('.awtad-ai-modal-textarea');
        const resultArea = modal.querySelector('.awtad-ai-modal-result');
        const statusArea = modal.querySelector('.awtad-ai-status');
        const actionButtons = modal.querySelectorAll('.awtad-ai-btn-action');

        // Load from localStorage
        textarea.value = localStorage.getItem(CONFIG.localStorageKey) || '';
        textarea.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                localStorage.setItem(CONFIG.localStorageKey, textarea.value);
            }, 300);
        });

        modal.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            switch (action) {
                case 'close':
                    modalOverlay.style.display = 'none';
                    break;
                case 'copy':
                    navigator.clipboard.writeText(resultArea.innerText).then(() => {
                        statusArea.textContent = 'تم النسخ!';
                        setTimeout(() => statusArea.textContent = '', 2000);
                    });
                    break;
                case 'improve':
                case 'compliance':
                case 'new':
                    callApi(action);
                    break;
            }
        });
        
        makeDraggable(modal);

        return modalOverlay;
    }

    function callApi(action) {
        if (isFetching) return;

        let text = textarea.value.trim();
        if (!text) {
            const mainContent = document.querySelector('main')?.innerText || document.body.innerText;
            text = mainContent.substring(0, CONFIG.maxPageReadLength);
        }

        if (!text) {
            statusArea.textContent = 'لم يتم العثور على نص للمعالجة.';
            statusArea.className = 'awtad-ai-status error';
            return;
        }

        isFetching = true;
        const actionButtons = modal.querySelectorAll('.awtad-ai-btn-action');
        actionButtons.forEach(btn => btn.disabled = true);
        statusArea.textContent = 'جاري المعالجة...';
        statusArea.className = 'awtad-ai-status loading';
        resultArea.innerHTML = '';

        fetch(CONFIG.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text.substring(0, CONFIG.maxTextLength),
                page: location.pathname,
                action: action
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            resultArea.innerHTML = data.result.replace(/\n/g, '<br>');
            statusArea.textContent = '';
        })
        .catch(error => {
            console.error('Awtad AI Widget Error:', error);
            statusArea.textContent = 'حدث خطأ. قد تكون هناك مشكلة في الشبكة أو CORS. (انظر الكونسول)';
            statusArea.className = 'awtad-ai-status error';
        })
        .finally(() => {
            isFetching = false;
            actionButtons.forEach(btn => btn.disabled = false);
            if (statusArea.classList.contains('loading')) {
                statusArea.textContent = '';
            }
        });
    }

    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('.awtad-ai-modal-header');
        
        if (header) {
            header.onmousedown = dragMouseDown;
        } else {
            element.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function findAndInsertButton() {
        const printSelectors = [
            'button:contains("طباعة")',
            'a:contains("طباعة")',
            'button:contains("Print")',
            'a:contains("Print")',
            '[onclick*="print"]'
        ];
        const targetContainerSelectors = ['header', '.topbar', 'body'];

        let targetElement = null;
        for (const selector of printSelectors) {
            try {
                // A pseudo-selector :contains is not standard, so we manually filter
                if (selector.includes(':contains')) {
                    const [el, text] = selector.split(':contains');
                    const searchText = text.replace(/['"]/g, '').slice(1, -1);
                    document.querySelectorAll(el).forEach(node => {
                        if (node.textContent.includes(searchText)) targetElement = node;
                    });
                } else {
                    targetElement = document.querySelector(selector);
                }
                if (targetElement) break;
            } catch (e) { /* ignore invalid selectors */ }
        }

        const aiButton = document.createElement('button');
        aiButton.className = 'awtad-ai-widget-button';
        aiButton.innerHTML = '🤖 مساعد السياسات';
        aiButton.onclick = () => {
            const modal = document.querySelector('.awtad-ai-modal-overlay');
            if (modal) modal.style.display = 'flex';
        };

        if (targetElement) {
            targetElement.parentNode.insertBefore(aiButton, targetElement.nextSibling);
            return true;
        }

        for (const selector of targetContainerSelectors) {
            const container = document.querySelector(selector);
            if (container) {
                container.appendChild(aiButton);
                return true;
            }
        }
        
        return false;
    }

    function init() {
        injectStyles();
        const modal = createModal();
        const textarea = modal.querySelector('.awtad-ai-modal-textarea');
        const resultArea = modal.querySelector('.awtad-ai-modal-result');
        const statusArea = modal.querySelector('.awtad-ai-status');

        if (findAndInsertButton()) {
            return; // Success
        }

        // If button not placed, use MutationObserver as a fallback
        const observer = new MutationObserver((mutations, obs) => {
            if (findAndInsertButton()) {
                obs.disconnect(); // Stop observing once the button is placed
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();