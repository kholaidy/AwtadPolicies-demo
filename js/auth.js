// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    fetchUserIdentity();
    setupMobileUserMenu();
});

async function fetchUserIdentity() {
    // العناصر في الواجهة
    const desktopBadge = document.getElementById('user-badge-desktop');
    const desktopEmail = document.getElementById('desktop-email');
    
    const mobileWrapper = document.getElementById('mobile-user-wrapper');
    const mobileEmail = document.getElementById('mobile-email');

    try {
        const response = await fetch('/cdn-cgi/access/get-identity');
        
        if (response.ok) {
            const data = await response.json();
            if (data.email) {
                // 1. حفظ الإيميل عالمياً للمساعد الذكي
                window.currentUserEmail = data.email; 

                // 2. تحديث واجهة سطح المكتب/التابلت
                if (desktopEmail) desktopEmail.textContent = data.email;
                if (desktopBadge) desktopBadge.classList.remove('hidden'); // تأكد من ظهورها في md/lg
                
                // 3. تحديث واجهة الموبايل
                if (mobileEmail) mobileEmail.textContent = data.email;
                if (mobileWrapper) mobileWrapper.style.display = 'block'; // إظهار أيقونة المستخدم

            } else {
                handleGuest();
            }
        } else {
            console.log("Running locally or not authenticated");
            handleLocalDev();
        }
    } catch (error) {
        console.warn('Auth check failed:', error);
        handleLocalDev(); // نعتبره وضع مطور في حالة الخطأ
    }
}

// وظائف مساعدة للعرض
function handleGuest() {
    const els = [document.getElementById('desktop-email'), document.getElementById('mobile-email')];
    els.forEach(el => { if(el) el.textContent = "زائر"; });
    window.currentUserEmail = "Visitor";
}

function handleLocalDev() {
    const els = [document.getElementById('desktop-email'), document.getElementById('mobile-email')];
    els.forEach(el => { if(el) el.textContent = "Dev / Local"; });
    window.currentUserEmail = "Local-Dev";
    
    // في الوضع المحلي، نظهر العناصر للتجربة
    const desktopBadge = document.getElementById('user-badge-desktop');
    const mobileWrapper = document.getElementById('mobile-user-wrapper');
    if (desktopBadge) desktopBadge.classList.remove('hidden');
    if (mobileWrapper) mobileWrapper.style.display = 'block';
}

// إدارة قائمة المستخدم في الموبايل
function setupMobileUserMenu() {
    const btn = document.getElementById('mobile-user-btn');
    const menu = document.getElementById('mobile-user-dropdown');

    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
            menu.classList.add('hidden');
        }
    });
}