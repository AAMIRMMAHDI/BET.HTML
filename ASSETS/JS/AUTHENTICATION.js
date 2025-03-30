

/* برای لاگین ثبت نام و فراموشی رمز عبور هستش */




// مدیریت فرم لاگین
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // اینجا می‌توانید لاگین کاربر را شبیه‌سازی کنید
    console.log('ورود با:', { email, password });
    alert('ورود با موفقیت انجام شد (شبیه‌سازی)');
    // window.location.href = 'index.html'; // ریدایرکت به صفحه اصلی بعد از لاگین
});

// مدیریت فرم ثبت‌نام
document.getElementById('signup-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('رمز عبور و تکرار آن مطابقت ندارند');
        return;
    }
    
    // اینجا می‌توانید ثبت‌نام کاربر را شبیه‌سازی کنید
    console.log('ثبت‌نام با:', { email, password });
    alert('ثبت‌نام با موفقیت انجام شد (شبیه‌سازی)');
    // window.location.href = 'login.html'; // ریدایرکت به صفحه لاگین بعد از ثبت‌نام
});

// مدیریت فرم فراموشی رمز عبور
document.getElementById('forgot-password')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('forgot-password-modal').style.display = 'block';
});

document.querySelector('.close-modal')?.addEventListener('click', function() {
    document.getElementById('forgot-password-modal').style.display = 'none';
});

document.getElementById('forgot-password-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('recovery-email').value;
    
    // اینجا می‌توانید بازیابی رمز عبور را شبیه‌سازی کنید
    console.log('بازیابی رمز برای:', { email });
    alert('لینک بازیابی رمز عبور به ایمیل شما ارسال شد (شبیه‌سازی)');
    document.getElementById('forgot-password-modal').style.display = 'none';
});

// بستن مودال با کلیک خارج از آن
window.addEventListener('click', function(e) {
    const modal = document.getElementById('forgot-password-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});


