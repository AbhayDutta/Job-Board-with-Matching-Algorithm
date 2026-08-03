<div align="center">

# Fitboard

**Job matching that *actually* fits.**

</div>

A modern job board that replaces keyword search with weighted cosine-similarity matching. Resumes are parsed into structured skill vectors and scored against every job listing — so recruiters get ranked shortlists and candidates stop shouting into keyword voids.

![Fitboard homescreen](./public/homescreen.png)

---

## How it works

```
Resume PDF  →  LLM extraction  →  Skill vector  →  Cosine similarity score  →  Ranked shortlist
```

1. **Upload** — Candidate drops a PDF/DOCX resume
2. **Structure** — LLM extracts skills, experience, and history into clean JSON
3. **Vectorize** — Skills are mapped into a weighted dimensional vector
4. **Match** — Every candidate–job pair is scored with `v_c · v_j / ‖v_c‖‖v_j‖`

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| AI | Google Gemini (resume parsing) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |

---

## Getting started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```


---

## Environment variables

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GEMINI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

## Razorpay Payment Integration (Test Mode)

Fitboard features a secure, hardened payment integration via Razorpay running strictly in **Test Mode** for premium job listing boosts and recruiter subscription plan upgrades.

### Security & Verification Standard
- **Server-Side Order Creation**: All Razorpay orders are generated via authenticated API `/api/payments/create-order`.
- **HMAC-SHA256 Signature Verification**: Payment receipts and webhooks are verified server-side via Razorpay signature verification (`/api/payments/verify` and `/api/payments/webhook`).
- **Webhook Idempotency**: Duplicate webhook triggers for the same `order_id` check `PaymentOrder.status` and return an idempotent response without double-updating database states.

### Demo Test Credentials
- **Success Test Card**: `4111 1111 1111 1111` | Any future Exp (e.g., `12/30`) | Any 3-digit CVV (e.g., `123`) | OTP: `123456`
- **Failure/Declined Test Card**: `4000 0000 0000 0002` | Any future Exp | Any CVV

### Database Field Updates
- **Premium Job Boost**: Updates `Job.isPremium = true` and ranks the boosted job at the top of candidate feeds with a `⚡ Premium` badge.
- **Recruiter Subscription**: Updates `User.plan = "RECRUITER"`.
- **Order Audit Trail**: Records transaction state (`CREATED` → `PAID`) in `PaymentOrder` table with `orderId`, `paymentId`, and `signature`.

---

## Features

- **Resume parsing** — PDF/DOCX → structured JSON via LLM
- **Skill-vector scoring** — Weighted cosine similarity, explainable and tunable
- **Razorpay Payments** — Premium job boosts & recruiter subscription checkout in Test Mode
- **Kanban pipeline** — Applied → Reviewed → Interviewed → Offered
- **Two-sided platform** — Separate dashboards for candidates and employers
- **Match score breakdown** — Per-skill weights visible on every application

---

Built by [Abhay Dutta](https://github.com/AbhayDutta)

