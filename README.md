# سازنده پسورد امن (PWA)

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=000)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)

> Tech stack: Tailwind CSS + Vanilla JS + PWA (Service Worker) + Web Crypto API

اپلیکیشن استاتیک برای تولید رمزهای قوی، نمایش قدرت رمز، ذخیره تاریخچه آفلاین (LocalStorage) و پشتیبانی از نصب به‌صورت PWA.

## امکانات
- تولید رمز امن با `crypto.getRandomValues`
- سطوح سختی: ساده، متوسط، سخت، دلخواه
- نمایش قدرت رمز و اندیکاتور
- ذخیره و مدیریت تاریخچه (کپی/حذف)
- انیمیشن ذرات پس‌زمینه
- PWA: کش آفلاین، نصب‌پذیر، `manifest.json`

## تکنولوژی‌ها و پکیج‌ها
- Tailwind CSS (Utility-first CSS)
- Vanilla JavaScript (بدون فریم‌ورک)
- PWA APIs: Service Worker + Web App Manifest
- Web Crypto API برای تولید تصادفی امن
- LocalStorage برای تاریخچه

ابزار توسعه (devDependencies):
- tailwindcss, postcss, autoprefixer
- eslint (+ plugin: import, promise) و eslint-config-prettier
- prettier
- http-server (برای اجرا محلی)
- concurrently (اجرای همزمان سرور و واچ CSS)

برای دیده‌شدن Tailwind در نمای پروژه:
- GitHub زبان Tailwind را جداگانه نمایش نمی‌دهد (زیرمجموعه CSS است). ما با `.gitattributes` کاری کردیم CSS در آمار لحاظ شود. برای تأکید، در توضیحات و بج‌ها نام Tailwind را آورده‌ایم و فایل‌های `tailwind.config.js`، `postcss.config.js` و `src/input.css` نیز در ریپو موجودند.

## پیش‌نیاز
این پروژه استاتیک است. برای توسعه محلی فقط به یک سرور ساده نیاز دارید (برای فعال‌شدن Service Worker).

## اجرای محلی
```bash
# نصب ابزارهای توسعه (ESLint/Prettier/http-server)
npm install

# بیلد CSS (یکبار)
npm run build:css

# اجرا (http://localhost:5173)
npm run dev

# حالت توسعه با واچ همزمان سرور و Tailwind
npm run dev:all
```
گزینه‌های جایگزین بدون npm:
- Python: `python -m http.server 5173`
- VSCode Live Server

> اجرای فایل‌ها با `file://` باعث عدم ثبت Service Worker می‌شود؛ حتماً از سرور محلی استفاده کنید.

## ساختار پروژه
```
.
├── index.html          # شِل اپ؛ رابط کاربری و المان‌های مورد نیاز app.js
├── src/
│   ├── app.js          # منطق برنامه
│   ├── input.css       # ورودی Tailwind
│   └── output.css      # خروجی build شده Tailwind
├── sw.js               # Service Worker (کش آفلاین)
├── manifest.json       # PWA manifest
├── package.json        # اسکریپت‌ها و ابزار توسعه
├── tailwind.config.js  # تنظیمات Tailwind
├── postcss.config.js   # تنظیمات PostCSS
├── .eslintrc.json      # ESLint config
├── .prettierrc.json    # Prettier config
├── .editorconfig       # قوانین عمومی ویرایشگر
├── .gitignore          # فایل‌های نادیده‌گرفته‌شده در گیت
├── .gitattributes      # تنظیمات GitHub Linguist برای آمار زبان‌ها
├── LICENSE             # مجوز MIT
└── README.md
```

## اسکریپت‌ها
- `npm run dev`: اجرای سرور محلی با http-server
- `npm run dev:css`: واچ Tailwind و تولید `src/output.css`
- `npm run build:css`: بیلد یکباره‌ی CSS
- `npm run dev:all`: اجرای همزمان سرور و واچ Tailwind
- `npm run lint`: بررسی کد با ESLint
- `npm run format`: فرمت کدها با Prettier
- `npm run check`: اجرای lint و بررسی فرمت

## انتشار روی GitHub Pages
1. ریپو بسازید و سورس را پوش کنید:
```bash
git init
git add .
git commit -m "init: password generator PWA"
# ریپو جدید در گیت‌هاب بسازید و remote اضافه کنید
# git remote add origin <repo-url>
git branch -M main
git push -u origin main
```
2. در تنظیمات ریپو، GitHub Pages را روی Branch `main` و مسیر `root` فعال کنید.
3. به آدرس Pages منتشرشده مراجعه کنید.

### Topics (نمایش بهتر در گیت‌هاب)
برای اینکه تکنولوژی‌ها بهتر دیده شوند، در صفحه ریپو → About → Topics این موارد را اضافه کنید:
`tailwindcss`, `vanilla-js`, `pwa`, `password-generator`, `rtl`, `persian`

### نکته آیکن‌ها
مسیر آیکن‌ها و اسکرین‌شات‌ها در `manifest.json` تعریف شده است. اگر این فایل‌ها را ندارید، یا آن‌ها را در ریشه اضافه کنید (مثل `icon-192x192.png`) یا از مانفیست حذف/تغییر مسیر دهید.

## مشارکت (Contributing)
- ایشو باز کنید یا PR ارسال کنید.
- قبل از ارسال، اجرا کنید: `npm run check`
- سعی کنید Commit Messageها تمیز و معنی‌دار باشند.

## امنیت
آسیب‌پذیری‌ها را عمومی منتشر نکنید. لطفاً طبق `SECURITY.md` گزارش دهید.

## مجوز
این پروژه تحت مجوز MIT منتشر می‌شود (فایل `LICENSE`).

---

اگر این پروژه برایتان مفید بود، لطفاً ستاره بدهید تا دیگران هم راحت‌تر پیدایش کنند ⭐
