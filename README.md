# Fitboard — Job Board with Matching Algorithm

Fitboard turns resumes into structured skill vectors and scores every
candidate–job pairing with weighted cosine similarity — so recruiters stop
guessing and candidates stop applying blind.

## 🖼️ Preview

![Fitboard homepage](./homepage.png)

## ✨ What it does

- **Resume parsing** — Drop a PDF or DOCX; an LLM extracts skills, experience,
  and education into validated, structured JSON.
- **Skill-vector matching** — Both job requirements and candidate profiles
  become weighted skill vectors (must-haves outweigh nice-to-haves). Cosine
  similarity produces a transparent, explainable percentage fit score —
  no black box.
- **Application pipeline** — A Kanban-style board (Applied → Reviewed →
  Interviewed → Offered) with calendar-synced interview scheduling and
  automated email notifications.
- **For candidates** — See a fit score before applying, get a personalised
  job feed based on your extracted skill vector, and track every application
  in one place.
- **For employers** — Post structured job requirements (must-have vs
  nice-to-have skills) and receive pre-ranked applicants instead of an
  unsorted queue.

## 🧠 The algorithm, in short

1. **Upload** — PDF/DOCX text is extracted (pdf-parse / mammoth), no manual
   form-filling.
2. **Parse** — An LLM extracts skills, experience, and education into
   validated JSON.
3. **Vectorize** — Job requirements and candidate profiles become weighted
   skill vectors.
4. **Rank** — Cosine similarity produces a % fit score; applicants are
   sorted, candidates get personalised recommendations.

## 🛠️ Tech Stack

> **Note:** This repository is a **UI/design prototype**, scaffolded with
> Lovable for rapid iteration on the Week 1 design deliverable. It currently
> runs on TanStack Start + Vite + shadcn/ui (Radix primitives). The planned
> production stack — documented in the full project synopsis — is
> **Next.js, TypeScript, Prisma, and Neon (serverless Postgres)**, which the
> UI will be migrated into for backend integration in subsequent weeks.

**Current prototype:**
- TanStack Start (React SSR) + TanStack Router
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI primitives)
- Bun

**Planned production stack:**
- Next.js (TypeScript)
- Prisma ORM + Neon (serverless PostgreSQL)
- NextAuth.js (role-based auth: candidate vs employer)
- Gemini API (LLM-based resume parsing)
- Razorpay (payments, test mode)
- Vercel (deployment)

## 📌 Status

**Week 1 of 4** — UI design and implementation complete. Backend (auth,
database, matching engine, resume parsing) begins Week 2.

## 📄 License

Academic project — for evaluation purposes.
