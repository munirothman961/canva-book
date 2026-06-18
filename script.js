/* =========================================================
   Canva Book Landing Page — Interactions
   - Countdown timer (24h cycle, persistent)
   - Real-time purchase notifications
   - Copy-to-clipboard for payment info
   - WhatsApp order link with prefilled message
   - Reveal on scroll
   ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     1. Countdown Timer — 24 hours, resets each visit
     ========================================================= */
  function startCountdown() {
    const KEY = 'canva_book_countdown_end';
    let endTime = parseInt(localStorage.getItem(KEY) || '0', 10);
    const now = Date.now();

    // If expired or missing, set a fresh 24h window
    if (!endTime || endTime < now) {
      endTime = now + 24 * 60 * 60 * 1000;
      localStorage.setItem(KEY, endTime.toString());
    }

    const $h = document.getElementById('cd-hours');
    const $m = document.getElementById('cd-minutes');
    const $s = document.getElementById('cd-seconds');
    if (!$h) return;

    function tick() {
      const remaining = Math.max(0, endTime - Date.now());
      const totalSec = Math.floor(remaining / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      $h.textContent = String(h).padStart(2, '0');
      $m.textContent = String(m).padStart(2, '0');
      $s.textContent = String(s).padStart(2, '0');

      if (remaining <= 0) {
        // reset to another 24h window
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(KEY, endTime.toString());
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  /* =========================================================
     2. Real-time purchase notifications
     ========================================================= */
  const buyers = [
    { name: 'أحمد', country: 'مصر', c: '#FF6B9D' },
    { name: 'فاطمة', country: 'السعودية', c: '#7D2AE8' },
    { name: 'يوسف', country: 'الإمارات', c: '#00C4CC' },
    { name: 'مريم', country: 'العراق', c: '#FFD93D' },
    { name: 'خالد', country: 'الأردن', c: '#FF8C42' },
    { name: 'سارة', country: 'تونس', c: '#7D2AE8' },
    { name: 'محمد', country: 'لبنان', c: '#00C4CC' },
    { name: 'نور', country: 'فلسطين', c: '#FF6B9D' },
    { name: 'عمر', country: 'الجزائر', c: '#FFD93D' },
    { name: 'ليلى', country: 'المغرب', c: '#FF8C42' },
    { name: 'حسن', country: 'سوريا', c: '#7D2AE8' },
    { name: 'هند', country: 'عُمان', c: '#00C4CC' },
    { name: 'ياسر', country: 'قطر', c: '#FF6B9D' },
    { name: 'رنا', country: 'الكويت', c: '#FFD93D' },
    { name: 'كريم', country: 'البحرين', c: '#FF8C42' },
    { name: 'دينا', country: 'مصر', c: '#7D2AE8' },
    { name: 'إسلام', country: 'السودان', c: '#00C4CC' },
    { name: 'شهد', country: 'اليمن', c: '#FF6B9D' },
  ];

  function startNotifications() {
    const el = document.getElementById('notif');
    if (!el) return;
    const $avatar = document.getElementById('notif-avatar');
    const $name = document.getElementById('notif-name');
    const $country = document.getElementById('notif-country');
    const $close = document.getElementById('notif-close');
    let hideTimer = null;
    let nextTimer = null;
    let active = true;

    // Don't show on very small screens immediately
    function isVisible() {
      return window.innerWidth > 380;
    }

    function pick() {
      return buyers[Math.floor(Math.random() * buyers.length)];
    }

    function show() {
      if (!active || !isVisible()) {
        schedule();
        return;
      }
      const b = pick();
      $avatar.textContent = b.name[0];
      $avatar.style.background = b.c;
      $name.textContent = b.name;
      $country.textContent = 'اشترى الكتاب للتو من ' + b.country;
      el.classList.add('show');

      hideTimer = setTimeout(() => {
        el.classList.remove('show');
        schedule();
      }, 5500);
    }

    function schedule() {
      const delay = 7000 + Math.random() * 8000; // 7-15s
      nextTimer = setTimeout(show, delay);
    }

    $close.addEventListener('click', () => {
      el.classList.remove('show');
      if (hideTimer) clearTimeout(hideTimer);
      schedule();
    });

    // First one after 4s
    nextTimer = setTimeout(show, 4000);
  }

  /* =========================================================
     3. Copy-to-clipboard for payment info
     ========================================================= */
  function setupCopyButtons() {
    const buttons = document.querySelectorAll('[data-copy]');
    if (!buttons.length) return;

    let toastEl = null;
    function toast(msg) {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = msg;
      toastEl.classList.add('show');
      setTimeout(() => toastEl.classList.remove('show'), 1800);
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const value = btn.getAttribute('data-copy');
        const label = btn.getAttribute('data-label') || 'تم النسخ';
        try {
          await navigator.clipboard.writeText(value);
          toast('✅ تم نسخ ' + label);
        } catch (e) {
          // Fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = value;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            toast('✅ تم نسخ ' + label);
          } catch (err) {
            toast('❌ تعذّر النسخ — انسخ يدوياً');
          }
          document.body.removeChild(ta);
        }
      });
    });
  }

  /* =========================================================
     4. WhatsApp order with prefilled message
     ========================================================= */
  function setupWhatsAppOrder() {
    const link = document.getElementById('orderWhatsApp');
    if (!link) return;

    const msg = `مرحباً 👋
أرغب في شراء كتاب "تعلّم تصميم وبيع قوالب Canva" (40 صفحة).

📌 *تفاصيل الطلب:*
• الكتاب: تعلم تصميم وبيع قوالب Canva
• السعر: 10$ (بدلاً من 25$)
• طريقة الدفع المختارة: ${'{Wish Money / USDT — سأحدد لاحقاً}'}

أرجو إرسال تعليمات الدفع لإتمام الطلب. شكراً! 🙏`;

    const url = 'https://wa.me/96176787559?text=' + encodeURIComponent(msg);
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
  }

  /* =========================================================
     5. Reveal on scroll
     ========================================================= */
  function setupReveal() {
    const targets = document.querySelectorAll(
      '.section__head, .pain__card, .learn__card, .ch, .review, .pay-card, .faq__item, .price-card, .contents__intro'
    );
    targets.forEach(el => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => io.observe(el));
  }

  /* =========================================================
     6. Smooth scroll for anchor links
     ========================================================= */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });
  }

  /* =========================================================
     Boot
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    startCountdown();
    startNotifications();
    setupCopyButtons();
    setupWhatsAppOrder();
    setupReveal();
    setupSmoothScroll();
  });
})();
