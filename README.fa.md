# پرسش (Porsesh)

**پرسش** یک پلتفرم ساخت فرم با کشیدن-و-رها کردن و آنالیتیکس است. فرم بسازید، با لینک عمومی منتشر کنید، پاسخ‌ها را جمع کنید و بازدید و نرخ تبدیل را دنبال کنید.

[English](README.md)

## تکنولوژی‌ها

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- احراز هویت با **Clerk**
- سازنده فرم با **dnd-kit**
- **Tailwind CSS** + **shadcn/ui**
- **React Hook Form** + **Zod**
- **Docker** / Docker Compose (اختیاری)

## قابلیت‌ها

- طراح فرم با کشیدن-و-رها کردن و پیش‌نمایش زنده
- انتشار فرم و اشتراک‌گذاری از طریق URL عمومی (`/submit/[formUrl]`)
- داشبورد آمار: بازدید، ارسال‌ها، نرخ ارسال، نرخ پرش (bounce)
- حذف نرم فرم‌ها (بر اساس وضعیت؛ حذف فیزیکی نمی‌شوند)
- حالت تاریک و پشتیبانی RTL در فیلد متنی (مناسب فارسی/عربی)
- انواع فیلد:
  - **ورودی:** متن، عدد، ناحیه متنی، تاریخ، انتخاب، چک‌باکس
  - **چیدمان:** عنوان، زیرعنوان، پاراگراف، جداکننده، فاصله‌گذار

## مسیرها

| مسیر | توضیح | احراز هویت |
|------|--------|------------|
| `/` | داشبورد: آمار + فهرست فرم‌ها | لازم |
| `/builder/[id]` | ویرایشگر کشیدن-و-رها کردن | لازم |
| `/forms/[id]` | آنالیتیکس و جدول ارسال‌ها | لازم |
| `/sign-in` / `/sign-up` | ورود / ثبت‌نام Clerk | عمومی |
| `/submit/[formUrl]` | ارسال عمومی فرم | عمومی |

## شروع کار

### پیش‌نیازها

- **Node.js 18+** (ایمیج Docker از Node 20 استفاده می‌کند)
- **PostgreSQL** (یا استفاده از Docker Compose)
- یک اپلیکیشن [Clerk](https://clerk.com) (کلیدهای publishable و secret)

### متغیرهای محیطی

فایل نمونه را کپی کنید و مقادیر را پر کنید:

```bash
cp .env.example .env
```

| متغیر | الزامی | توضیح |
|-------|--------|--------|
| `POSTGRES_PRISMA_URL` | برای لوکال بله | رشته اتصال PostgreSQL برای Prisma |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | بله | کلید publishable کلرک |
| `CLERK_SECRET_KEY` | بله | کلید secret کلرک |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | برای Docker | ساخت دیتابیس و URL در Compose |
| `POSTGRES_PORT` / `APP_PORT` | خیر | پورت‌های میزبان (پیش‌فرض `5432` / `3000`) |

برای توسعه محلی (خارج از Docker)، مثلاً:

```env
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/porsesh
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### توسعه محلی

```bash
npm install
npx prisma migrate dev   # اعمال migrationها + تولید کلاینت Prisma
npm run dev              # http://localhost:3000
```

بعد از `npm install`، اسکریپت `postinstall` به‌طور خودکار `prisma generate` را اجرا می‌کند.

### Docker

کلیدهای Clerk باید در `.env` باشند (در غیر این صورت Compose بلافاصله خطا می‌دهد):

```bash
cp .env.example .env
# فایل .env را ویرایش کنید — کلیدهای Clerk را بگذارید (و ترجیحاً POSTGRES_PASSWORD قوی)
docker compose up --build
```

این دستور PostgreSQL 15 و اپ Next.js را بالا می‌آورد. هنگام استارت، کانتینر اپ `prisma migrate deploy` را اجرا می‌کند و سپس سرور را روی [http://localhost:3000](http://localhost:3000) سرو می‌دهد.

## اسکریپت‌ها

| اسکریپت | توضیح |
|---------|--------|
| `npm run dev` | سرور توسعه با HMR |
| `npm run build` | بیلد پروداکشن |
| `npm run start` | اجرای سرور پروداکشن |
| `npm run lint` | بررسی ESLint |

## ساختار پروژه (خلاصه)

```
app/            # مسیرهای App Router (داشبورد، بیلدر، ارسال، احراز هویت)
actions/        # Server actions (CRUD فرم، انتشار، ارسال، آمار)
components/     # UI بیلدر، فیلدها، shadcn/ui
lib/            # کلاینت Prisma و ابزارها
prisma/         # اسکیما و migrationها
schemas/        # اسکیماهای Zod
```

## مجوز

این پروژه بدون مجوز مشخص، به همان شکلی که هست ارائه شده است.
