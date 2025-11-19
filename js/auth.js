// js/auth.js
// ملف مخصص لإدارة هوية المستخدم عبر Cloudflare Access

document.addEventListener('DOMContentLoaded', () => {
    fetchUserIdentity();
});

async function fetchUserIdentity() {
    const emailDisplay = document.getElementById('user-email-display');
    const userBadge = document.getElementById('user-badge');

    // إذا لم يكن العنصر موجوداً في الصفحة، لا تفعل شيئاً
    if (!emailDisplay) return;

    try {
        // هذا الرابط توفره Cloudflare تلقائياً لأي موقع محمي بـ Zero Trust
        const response = await fetch('/cdn-cgi/access/get-identity');
        
        if (response.ok) {
            const data = await response.json();
            if (data.email) {
                emailDisplay.textContent = data.email;
                // إظهار الشارة فقط عند نجاح الجلب
                if (userBadge) {
                    userBadge.classList.remove('hidden'); 
                    userBadge.classList.add('flex'); // لضمان التنسيق
                    userBadge.title = "تم تسجيل الدخول بأمان عبر Cloudflare Zero Trust";
                }
            } else {
                emailDisplay.textContent = "زائر";
            }
        } else {
            // في حالة العمل محلياً (Localhost) أو فشل الاتصال
            console.log("Running locally or not authenticated via Cloudflare Access");
            // يمكنك إخفاء الشارة أو إظهار نص بديل
            // if (userBadge) userBadge.classList.add('hidden');
             emailDisplay.textContent = "Local / Dev"; 
        }
    } catch (error) {
        console.warn('Could not fetch user identity:', error);
        emailDisplay.textContent = "غير متصل";
    }
}