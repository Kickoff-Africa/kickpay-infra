# KickPay

B2B fintech app (NGN–CNY payment gateway). Next.js (App Router), TypeScript, Tailwind, Prisma + SQLite, with a dedicated dashboard and API for merchants.

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Prisma + SQLite
- **Auth:** Session-based (cookies); password hashing via bcrypt
- **Forms & validation:** React Hook Form + Zod on the client; Zod on the server (shared schemas in `src/lib/validations/`)

## Form validation

- **Client:** React Hook Form with `@hookform/resolvers/zod` for login, register, and onboarding. Field-level and root errors are shown.
- **Server:** All auth and onboarding API routes validate request bodies with the same Zod schemas from `src/lib/validations/auth.ts` and `src/lib/validations/onboarding.ts`.
- **Flows:** Register (email + password) → Onboarding (phone, business name, country) → Dashboard. Login goes straight to dashboard.

## Roles & Auth

- **User roles** (stored in `User.role`): `user` (default for merchants), `admin`, `super_admin`. Admins and super admins use the **same login** as regular users (`POST /api/auth/login`); after login, role is available in the session and UI (e.g. redirect or show admin dashboard).
- **Super admin seed:** A super admin account is seeded for initial access. Run `npm run db:seed` (or `node prisma/seed.js`) to create or update it:
  - **Email:** `superadmin@kickpay.com`
  - **Password:** `SecurePassword@123`
  - **Role:** `super_admin`

## Verification & Admin (current)

- **User verification:** From Dashboard → Verification, users submit BVN, TIN, CAC document (required), and optional other documents (PDF/JPEG/PNG, max 10MB). Submissions are stored with status `pending`.
- **Admin review:** Users with `role = "admin"` or `"super_admin"` see an **Admin** link in the dashboard sidebar. The Admin area lists pending verification submissions; approving one issues a **live API key** to that user and sets their account to verified. Rejected submissions can include an optional reason (shown to the user).
- **Making an admin:** Set a user’s `role` to `"admin"` or `"super_admin"` in the database (e.g. via Prisma Studio or SQL). Only super admins can invite other admins (see Admin dashboard scope below).

## Admin dashboard (scope)

The admin dashboard is available to users with role `admin` or `super_admin` and includes (or will include):

| Area | Description |
|------|--------------|
| **Overview** | Admin-specific summary and quick stats. |
| **Analytics** | API usage (requests, endpoints, users, errors). |
| **User management** | List users; approve accounts; flag malicious users; suspend/restore; other user controls. |
| **Transaction management** | View transactions; resolve disputes; initiate refunds; and other transaction-related actions. |
| **Admin user management** | Invite other admins (e.g. send invite email or create admin accounts); manage admin/super_admin roles. |
| **Verification** | (Current) Review verification submissions and approve/reject to grant live API keys. |

Same login endpoint is used for all roles; access to admin routes and UI is gated by `User.role`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To create the super admin account (e.g. for first-time setup), run:

```bash
npm run db:seed
```

Then log in at `/login` with `superadmin@kickpay.com` / `SecurePassword@123` to access the admin dashboard.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
