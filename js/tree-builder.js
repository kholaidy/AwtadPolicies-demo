// js/tree-builder.js

function buildTree(treeRoot, classificationData) {
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) {
        console.error("Fatal Error: content-container not found.");
        return;
    }

    treeRoot.innerHTML = '';

    Object.entries(classificationData).forEach(([domainName, domainData]) => {
        const domainItem = document.createElement('div');
        domainItem.className = 'domain-item';

        const domainHeader = document.createElement('div');
        domainHeader.className = 'domain-header';
        domainHeader.dataset.domain = domainName;
        domainHeader.innerHTML = `
            <div class="domain-title">
                <span class="icon">◀</span>
                <div class="domain-name">
                    <strong>${domainName}</strong><br>
                    <span>${domainData.nameEn}</span>
                </div>
            </div>
        `;

        const manualsContainer = document.createElement('div');
        manualsContainer.className = 'manuals-container hidden';

        Object.entries(domainData.manuals).forEach(([manualName, manualData]) => {
            const manualItem = document.createElement('div');
            manualItem.className = 'manual-item';

            const manualHeader = document.createElement('div');
            manualHeader.className = 'manual-header';
            manualHeader.dataset.manualCode = manualData.code;
            
            // [تعديل]: إضافة data-file ليعمل المساعد الذكي بشكل صحيح
            manualHeader.setAttribute('data-file', manualData.code);

            manualHeader.innerHTML = `
                <div class="manual-title">
                    <span class="icon">◀</span>
                    <div class="manual-name">
                        <strong>${manualName}</strong><br>
                        <span>${manualData.code}</span>
                    </div>
                </div>
            `;

            const policiesContainer = document.createElement('div');
            policiesContainer.className = 'policies-container hidden';

            manualData.policies.forEach(policy => {
                const policyItem = document.createElement('a');
                policyItem.className = 'policy-item';
                policyItem.href = `#${policy.code}`;
                policyItem.dataset.policyCode = policy.code;
                policyItem.innerHTML = `
                    <span class="icon">📄</span>
                    <div class="policy-name">
                        <strong>${policy.name}</strong><br>
                        <span>${policy.code}</span>
                    </div>
                `;

                // --- منطق النقر على السياسة ---
                policyItem.addEventListener('click', function(event) {
                    event.preventDefault();
                    const parentManualHeader = this.closest('.manual-item').querySelector('.manual-header');
                    const isParentActive = parentManualHeader.classList.contains('active');
                    
                    document.querySelectorAll('.policy-item.active').forEach(item => item.classList.remove('active'));
                    this.classList.add('active');
                    history.pushState(null, '', this.href);

                    if (!isParentActive) {
                        parentManualHeader.click();
                        setTimeout(() => {
                            scrollToSection(this.dataset.policyCode);
                        }, 300); 
                    } else {
                        scrollToSection(this.dataset.policyCode);
                    }

                    // --- إغلاق القائمة الجانبية في الموبايل عند اختيار سياسة ---
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.querySelector('.overlay');
                    
                    if (sidebar && sidebar.classList.contains('open')) {
                        sidebar.classList.remove('open');
                        if (overlay) {
                            overlay.remove();
                        }
                    }
                });

                policiesContainer.appendChild(policyItem);
            });

            manualItem.appendChild(manualHeader);
            manualItem.appendChild(policiesContainer);
            manualsContainer.appendChild(manualItem);

            // --- منطق النقر على الدليل ---
            manualHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                
                policiesContainer.classList.toggle('hidden');
                manualHeader.classList.toggle('expanded');
                
                if (!manualHeader.classList.contains('active')) {
                    document.querySelectorAll('.manual-header.active').forEach(h => h.classList.remove('active'));
                    manualHeader.classList.add('active');
                    loadPolicyContent(manualData.code, contentContainer);
                }

                // --- إغلاق القائمة الجانبية في الموبايل عند اختيار الدليل ---
                const sidebar = document.getElementById('sidebar');
                const overlay = document.querySelector('.overlay');
                
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    if (overlay) {
                        overlay.remove();
                    }
                }
            });
        });

        domainItem.appendChild(domainHeader);
        domainItem.appendChild(manualsContainer);
        treeRoot.appendChild(domainItem);

        // --- منطق النقر على القسم الرئيسي (مع إغلاق الفروع) ---
        domainHeader.addEventListener('click', () => {
            const isNowExpanded = domainHeader.classList.toggle('expanded');
            manualsContainer.classList.toggle('hidden');

            if (!isNowExpanded) {
                const allManualHeaders = manualsContainer.querySelectorAll('.manual-header.expanded');
                const allPoliciesContainers = manualsContainer.querySelectorAll('.policies-container:not(.hidden)');

                allManualHeaders.forEach(header => {
                    header.classList.remove('expanded');
                });

                allPoliciesContainers.forEach(container => {
                    container.classList.add('hidden');
                });
            }
        });
    });
}