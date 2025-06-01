document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const contentContainer = document.getElementById('content-container');
    const printBtn = document.getElementById('print-btn');
    const sidebarSearch = document.getElementById('sidebar-search');
    
    // Policy Items
    const policyHeaders = document.querySelectorAll('.policy-header');
    // تم تعديل هذا السطر ليشمل `.policy-header` لضمان إزالة التحديد من جميع العناصر النشطة
    const policyItems = document.querySelectorAll('.policy-item, .policy-subitem, .policy-header');
    
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
    
    // Toggle Policy Children
    policyHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            const parent = this.parentElement;
            const children = parent.querySelector('.policy-children');
            
            if (children) {
                e.stopPropagation();
                this.classList.toggle('expanded');
                children.classList.toggle('hidden');
            }
            
            // Load content if it has a data-file attribute
            const file = this.getAttribute('data-file');
            if (file) {
                loadPolicyContent(file);
                
                // Set active state
                policyItems.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Handle Policy Subitem Click
    document.querySelectorAll('.policy-subitem').forEach(item => {
        item.addEventListener('click', function() {
            const file = this.getAttribute('data-file');
            if (file) {
                loadPolicyContent(file);
                
                // Set active state
                policyItems.forEach(item => item.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Print Button
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Sidebar Search
    sidebarSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        policyItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const parent = item.closest('.policy-item');
            
            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
                if (parent && searchTerm.length > 0) {
                    const children = parent.querySelector('.policy-children');
                    if (children) {
                        children.classList.remove('hidden');
                        parent.querySelector('.policy-header').classList.add('expanded');
                    }
                }
            } else {
                // Don't hide parent items
                if (!item.classList.contains('policy-header')) {
                    item.style.display = 'none';
                }
            }
        });
        
        // If search is cleared, reset view
        if (searchTerm === '') {
            policyItems.forEach(item => {
                item.style.display = '';
                const parent = item.closest('.policy-item');
                if (parent) {
                    const children = parent.querySelector('.policy-children');
                    if (children) {
                        children.classList.add('hidden');
                        parent.querySelector('.policy-header').classList.remove('expanded');
                    }
                }
            });
        }
    });
    
    // Function to load policy content
    function loadPolicyContent(file) {
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
                
                // Add content search functionality
                addContentSearch();
                
                // Close mobile sidebar after loading content
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
    
    // Function to add content search functionality
    function addContentSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'بحث في المحتوى...';
        searchInput.classList.add('w-full', 'px-3', 'py-2', 'border', 'border-gray-300', 'rounded-md', 'text-right', 'mb-4');
        
        // Insert at the top of content
        contentContainer.insertBefore(searchInput, contentContainer.firstChild);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length < 2) {
                // Reset all highlighting
                contentContainer.innerHTML = contentContainer.innerHTML.replace(/<mark class="bg-yellow-200">(.*?)<\/mark>/g, '$1');
                return;
            }
            
            // First remove any existing highlights
            contentContainer.innerHTML = contentContainer.innerHTML.replace(/<mark class="bg-yellow-200">(.*?)<\/mark>/g, '$1');
            
            // Then add new highlights
            highlightText(contentContainer, searchTerm);
            
            // Scroll to first match
            const firstMark = contentContainer.querySelector('mark');
            if (firstMark) {
                firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
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
});