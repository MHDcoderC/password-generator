# سازنده پسورد امن – Password Generator (FA/EN)

![Stack](https://img.shields.io/badge/Stack-Tailwind%20CSS%20%7C%20Vite%20%7C%20JavaScript%20%7C%20PWA-0f172a)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=111827)](https://developer.mozilla.org/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Last Update](https://img.shields.io/badge/Last%20Update-19%20March%202026-10b981)](https://github.com/MHDcoderC/password-generator/commits/main)

<img src="https://mmdcode.top/images/3.png" alt="screen" />

> 🚀 **آخرین بروزرسانی: ۱۹ مارس ۲۰۲۶ (۲۹ اسفند ۱۴۰۴)** - ریفکتور کامل به معماری ماژولار + فونت محلی

## 📋 تغییرات نسخه جدید (Changelog)

### نسخه ۲.۰.۰ - ریفکتور معماری (۱۹ مارس ۲۰۲۶)

#### 🏗️ معماری جدید (Breaking Changes)
- **تقسیم‌بندی ماژولار**: تبدیل `app.js` تک‌فایل ۷۰۰ خطی به ساختار سرویس‌محور
  - `src/config/constants.js` - مرکز ثابت‌ها و پیکربندی
  - `src/services/cryptoService.js` - رمزنگاری AES-GCM
  - `src/services/passwordService.js` - تولید و مدیریت پسورد
  - `src/services/uiService.js` - مدیریت رابط کاربری
  - `src/services/effectsService.js` - افکت‌های ویژوال
  - `src/utils/domHelpers.js` - توابع کمکی DOM
  - `src/utils/formatters.js` - قالب‌بندی داده‌ها

#### 📚 مستندسازی حرفه‌ای
- اضافه شدن JSDoc برای همه توابع با `@param`, `@returns`, `@example`
- کامنت‌گذاری فارسی واضح در تمام فایل‌ها
- مستندسازی خطاهای اختصاصی (`CryptoError`, `PasswordError`)

#### 🛡️ بهبودهای امنیتی
- جداسازی کامل منطق رمزنگاری در سرویس اختصاصی
- مدیریت چرخه عمر Master Key با کشینگ امن
- اعتبارسنجی ورودی‌ها با پیام‌های خطای معنی‌دار
- بررسی پشتیبانی مرورگر قبل از عملیات رمزنگاری

#### ⚡ بهبودهای عملکرد
- کش کردن عناصر DOM با کلاس `DOMCache`
- استفاده از Fisher-Yates shuffle برای تصادفی‌سازی امن پسورد
- کاهش تکرار کد با توابع کمکی مرکزی

#### 🧹 تمیزکاری
- حذف فایل‌های غیرضروری (`postcss.config.js`, `tailwind.config.js`, `src/output.css`)
- حذف فالbacks ناامن (Math.random)
- استانداردسازی نام‌گذاری و ساختار فایل‌ها

#### 🔤 فونت محلی (Offline Font)
- دانلود فونت Vazirmatn (وزن‌های 400، 500، 600، 700، 800) به `public/fonts/`
- حذف وابستگی به Google Fonts CDN
- قابلیت اجرای کامل بدون اینترنت (سازگار با نت ملی)
- بهبود سرعت لود با `font-display: swap`

---
### نسخه‌های قبلی
یک اپلیکیشن سبک، مدرن و قابل‌توسعه برای ساخت رمزهای قوی با UI شیشه‌ای (Glassmorphism)، پارتیکل سبک، PWA و Web Crypto API. این پروژه با Tailwind + Vanilla JS + Vite ساخته شده است.

## امکانات (FA)

- ساخت رمز با سطوح سختی مختلف (آسان/متوسط/سخت) و گزینه‌های سفارشی (حروف بزرگ/کوچک/اعداد/نمادها)
- نمایش رمز تولیدشده در یک مدال با عملیات: ذخیره، کپی، تولید مجدد
- توست‌های زیبا برای بازخورد عملیات (ذخیره شد، کپی شد، حذف شد و ...)
- تاریخچه رمزها با امکان کپی، حذف آیتم و حذف کلی
- حالت امن (Secure Save): ذخیره‌سازی رمزها به‌صورت رمزنگاری‌شده (AES‑GCM) با «کلید اصلی» کاربر. در این حالت متن رمز ذخیره نمی‌شود و تنها با واردکردن کلید قابل نمایش/کپی است.
- ذخیره‌سازی محلی: نگهداری هش SHA-256 هر رمز؛ در حالت عادی متن رمز نیز برای نمایش/کپی ذخیره می‌شود.
- لودر اولیه هنگام شروع برنامه و پس‌زمینه پارتیکلی سبک
- پس‌زمینه پارتیکلی سبک و عملکرد بالا
- فونت فارسی جذاب Vazirmatn
- فوتر ثابت: «توسط mmdcode محمد سجادی نوشته شده»

## امنیت (FA)

- تولید رمز با Web Crypto API (secure randomness) انجام می‌شود.
- هش هر رمز با Web Crypto API (SHA-256) محاسبه و روی دستگاه کاربر نگهداری می‌شود.
- «حالت امن» (اختیاری): با فعال‌کردن گزینه «ذخیره امن (AES‑GCM)» در تنظیمات پیشرفته، متن رمزها ذخیره نمی‌شود؛ فقط نسخه رمزنگاری‌شده به‌همراه IV نگهداری می‌شود. کلید اصلی توسط کاربر تعیین می‌شود و صرفاً hint آن در localStorage ذخیره می‌گردد.
- برای Clipboard API و PWA، اجرای HTTPS/localhost ضروری است. Fallback ناامن حذف شده است.
- برای عملکرد کامل API کلیپ‌بورد، اپ را روی HTTPS یا localhost اجرا کنید؛ در محیط ناامن، fallback برای کپی تعبیه شده است.
- اطلاعات فقط روی دستگاه کاربر باقی می‌ماند و جایی ارسال نمی‌شود. برای امنیت بالاتر، از ذخیره رمزهای بسیار حساس خودداری کنید.

## اجرا (FA)

1. نصب وابستگی‌ها (Tailwind فقط برای بیلد CSS استفاده می‌شود):

```bash
npm install
```

2. توسعه با Vite (HTTPS توصیه می‌شود):

```bash
npm run dev
```

Vite سرور محلی را اجرا می‌کند. برای Clipboard API کامل و SW، روی HTTPS یا localhost اجرا کنید. استایل‌ها کاملاً با Tailwind (@layer/@apply در `src/input.css`) تولید می‌شوند و فایل CSS سفارشی حذف شده است. فایل‌های PWA (`manifest.webmanifest`, `sw.js`) در روت پروژه قرار دارند و در بیلد در `dist/` کپی می‌شوند.

3. Build نهایی:

```bash
npm run build && npm run preview
```

## تکنولوژی‌ها (FA)

- Tailwind CSS
- JavaScript (Vanilla)
- Web Crypto API (SHA-256، اعداد تصادفی امن)
- PWA (Service Worker, Manifest)
- Vite (Dev/Build)
## راهنمای توسعه/مشارکت (FA)

- ساختار ساده است و وابستگی‌ها حداقلی‌اند. اگر فیچر جدید اضافه می‌کنید، تلاش کنید بدون فریم‌ورک باقی بماند، مگر اینکه ارزش افزوده مشخص باشد.
- برای فیچرهای امنیتی (مانند ذخیره‌سازی رمزنگاری‌شده)، حتماً threat model کوتاه در PR بنویسید.
- تلاش کنید UI/UX حداقلی، سریع و RTL را حفظ کنید. آیکن‌ها و تعاملات باید دسترس‌پذیر باشند (aria-label، کلید Esc برای بستن مدال‌ها).
- اگر روی امنیت کار می‌کنید: threat-model کوتاه، مدیریت salt تصادفی per-user، و انتخاب تعداد iteration مناسب برای PBKDF2 را مستندسازی کنید.
- اجرای «اجبار حداقل یک کاراکتر از هر گروه انتخاب‌شده» در تولید رمز را می‌توانید توسعه دهید (در حال حاضر معیار قدرت پوشش داده می‌شود).

### حالت امن (Secure Save) – چگونه کار می‌کند؟
1) فعال‌سازی از مسیر: تنظیمات پیشرفته → تیک «ذخیره امن (AES‑GCM)»
2) تعیین کلید اصلی (دکمه «تنظیم کلید اصلی»): کلید با PBKDF2 (SHA‑256, 150k iters) به کلید AES‑GCM تبدیل و فقط در حافظه نگهداری می‌شود. Hint در localStorage ذخیره می‌شود.
3) ذخیره رمز: فقط نسخه رمزنگاری‌شده ذخیره می‌شود (base64 شامل IV||Cipher).
4) کپی از تاریخچه: ابتدا تلاش برای خواندن متن؛ اگر نبود، رمزگشایی با کلید اصلی.

Pull Request خوش‌آمد است! لطفاً قبل از ارسال PR، تغییرات را به‌صورت خلاصه در توضیحات بنویسید.

## لایسنس (FA)

این پروژه تحت لایسنس MIT منتشر شده است. جزئیات در فایل `LICENSE` موجود است.

---

اگر این پروژه برایتان مفید بود، لطفاً ⭐️ بدهید. ممنون از حمایت شما!

---

## Features (EN)

- Strong password generation with customizable options (upper/lower/numbers/symbols)
- Difficulty presets and a live strength badge
- Beautiful modal with Save/Copy/Regenerate actions and toast notifications
- Local history with copy/delete/clear; SHA-256 stored; optional Secure Save (AES‑GCM) where plaintext is not stored
- **Offline-first: All fonts loaded locally (no CDN dependency)**
- Loader, lightweight particle background, RTL-friendly UI
- PWA (service worker + manifest) and Vite-powered dev/build

## Security (EN)

- Randomness and hashing use Web Crypto API (getRandomValues, SHA-256). Optional Secure Save encrypts entries with AES‑GCM using a user-derived key (PBKDF2, SHA‑256, 150k iters). Clipboard works on HTTPS/localhost only.
- Clipboard API requires secure context (HTTPS or localhost). A fallback copy method is included for non-secure contexts.

## Getting Started (EN)

```bash
npm install
npm run dev        # start Vite dev server
npm run build      # build for production
npm run preview    # preview production build locally
```

## Tech (EN)

- Tailwind CSS, Vanilla JavaScript
- Web Crypto API (SHA-256, secure randomness)
- PWA (Service Worker, Manifest)
- Vite (development and build)

## Deploy to GitHub Pages

1) Create repo, then push:

```bash
git init
git add .
git commit -m "feat: initial release (Tailwind + Vite + PWA)"
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

2) Enable Pages: GitHub → Settings → Pages → Build from branch → `gh-pages` or use Actions to deploy `dist/`.

For simple manual deploy, you can use `peaceiris/actions-gh-pages` in CI or run:

```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

## Contributing (EN)

- Keep the footprint small and the UI snappy. If adding security features, include a brief threat model in your PR. Maintain accessibility and RTL support.
