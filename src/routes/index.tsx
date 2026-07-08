import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background text-xs">◆</span>
          Fitboard
        </a>
        <nav className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#roles" className="hover:text-foreground">For you</a>
          <a href="#pipeline" className="hover:text-foreground">Pipeline</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#" className="hidden text-sm font-medium text-foreground/80 hover:text-foreground md:inline">Sign in</a>
          <a
            href="#"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg hover:opacity-90"
          >
            Post a job →
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[oklch(0.88_0.22_130/0.05)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.18_35)]" />
            Now parsing resumes with structured LLM extraction
          </div>
          <h1 className="mt-6 font-serif text-5xl leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-[88px]">
            Job matching that
            <span className="italic"> actually </span>
            <span className="relative inline-block">
              fits.
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[oklch(0.88_0.22_130)] -z-10" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Fitboard turns resumes into structured skill vectors and scores every
            candidate–job pairing with weighted cosine similarity — so recruiters stop
            guessing and candidates stop shouting into keyword voids.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg hover:opacity-90"
            >
              I'm hiring
            </a>
            <a
              href="#"
              className="rounded-full border border-foreground/20 bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:scale-105 hover:border-foreground/40 hover:bg-secondary"
            >
              I'm job hunting
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 text-sm">
            <Stat n="94%" l="avg. fit accuracy" />
            <Stat n="4.2s" l="resume → parsed JSON" />
            <Stat n="0" l="keyword-only searches" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <MatchCard />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-foreground">{n}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
    </div>
  );
}

function MatchCard() {
  const skills = [
    { name: "TypeScript", weight: "must", score: 98 },
    { name: "PostgreSQL", weight: "must", score: 92 },
    { name: "Prisma ORM", weight: "must", score: 88 },
    { name: "Next.js", weight: "nice", score: 76 },
    { name: "LLM APIs", weight: "nice", score: 71 },
  ];
  return (
    <div className="relative animate-scale-in">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-[oklch(0.88_0.22_130)] opacity-30 blur-2xl animate-pulse" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_20px_60px_-20px_oklch(0.18_0.02_250/0.25)] transition-all duration-300 hover:shadow-[0_30px_80px_-20px_oklch(0.18_0.02_250/0.35)] hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Match report
            </div>
            <div className="mt-1 font-serif text-xl text-foreground">
              Priya S. → Senior Backend Eng.
            </div>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-[oklch(0.88_0.22_130)] font-serif text-xl font-bold text-foreground">
            87%
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {skills.map((s) => (
            <div key={s.name}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <span
                    className={
                      s.weight === "must"
                        ? "rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] font-semibold uppercase text-background"
                        : "rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground"
                    }
                  >
                    {s.weight}
                  </span>
                  {s.name}
                </div>
                <div className="tabular-nums text-muted-foreground">{s.score}</div>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>cosine similarity · weighted vectors</span>
          <span className="font-mono">v_c · v_j / ‖v_c‖‖v_j‖</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks({ className = "" }: { className?: string }) {
  const steps = [
    {
      k: "01",
      t: "Upload",
      d: "Drop a PDF or DOCX. We pull the text with pdf-parse / mammoth — no manual form filling.",
    },
    {
      k: "02",
      t: "Parse",
      d: "An LLM extracts skills, experience and education into validated JSON, stored in Postgres.",
    },
    {
      k: "03",
      t: "Vectorize",
      d: "Both job requirements and candidate profiles become weighted skill vectors — must-haves outweigh nice-to-haves.",
    },
    {
      k: "04",
      t: "Rank",
      d: "Cosine similarity produces a % fit score. Applicants get sorted, candidates get personal recs.",
    },
  ];
  return (
    <section id="how" className={`border-b border-border bg-secondary/40 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The algorithm
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
              From messy PDF to ranked shortlist in four moves.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            No black boxes. Every score can be broken down to which skills matched,
            which didn't, and how much each was weighted.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.k} className="group relative bg-background p-8 transition-all duration-300 hover:bg-card hover:-translate-y-1" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="font-mono text-xs text-muted-foreground">{s.k}</div>
              <div className="mt-6 font-serif text-2xl text-foreground">{s.t}</div>
              <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roles({ className = "" }: { className?: string }) {
  return (
    <section id="roles" className={`border-b border-border ${className}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 divide-border md:grid-cols-2 md:divide-x">
        <div className="p-10 lg:p-16">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            For candidates
          </div>
          <h3 className="mt-4 font-serif text-4xl text-foreground">
            One resume. A hundred honest matches.
          </h3>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              "See a % fit score before you apply — no more spraying resumes",
              "Personalised job feed based on your extracted skill vector",
              "Track every application on a Kanban dashboard",
              "Salary insights and saved-search alerts",
            ].map((x) => (
              <li key={x} className="flex gap-3 text-foreground">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[oklch(0.88_0.22_130)]" />
                {x}
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-semibold text-foreground transition-all duration-300 hover:border-b-2 hover:translate-x-1"
          >
            Build my profile →
          </a>
        </div>

        <div className="bg-foreground p-10 text-background lg:p-16">
          <div className="text-xs uppercase tracking-[0.2em] text-background/60">
            For employers
          </div>
          <h3 className="mt-4 font-serif text-4xl">
            Post once. Get ranked applicants, not stacks.
          </h3>
          <ul className="mt-8 space-y-4 text-sm">
            {[
              "Structured job forms: must-have vs nice-to-have skills",
              "Applicants pre-ranked by objective fit score",
              "Kanban pipeline: Applied → Reviewed → Interviewed → Offered",
              "Calendar-synced interview scheduling + email alerts",
            ].map((x) => (
              <li key={x} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[oklch(0.88_0.22_130)]" />
                {x}
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="mt-10 inline-flex items-center gap-2 border-b border-background pb-1 text-sm font-semibold transition-all duration-300 hover:border-b-2 hover:translate-x-1"
          >
            Post a role →
          </a>
        </div>
      </div>
    </section>
  );
}

function Pipeline({ className = "" }: { className?: string }) {
  const cols = [
    { name: "Applied", count: 42, tone: "bg-secondary" },
    { name: "Reviewed", count: 18, tone: "bg-[oklch(0.94_0.06_95)]" },
    { name: "Interviewed", count: 7, tone: "bg-[oklch(0.92_0.12_130)]" },
    { name: "Offered", count: 2, tone: "bg-foreground text-background" },
  ];
  const cards: Record<string, { name: string; role: string; fit: number }[]> = {
    Applied: [
      { name: "Arjun M.", role: "Frontend", fit: 71 },
      { name: "Sara K.", role: "Frontend", fit: 68 },
      { name: "Ravi P.", role: "Frontend", fit: 64 },
    ],
    Reviewed: [
      { name: "Nina D.", role: "Frontend", fit: 82 },
      { name: "Omar B.", role: "Frontend", fit: 79 },
    ],
    Interviewed: [{ name: "Priya S.", role: "Frontend", fit: 87 }],
    Offered: [{ name: "Jules T.", role: "Frontend", fit: 93 }],
  };
  return (
    <section id="pipeline" className={`border-b border-border bg-secondary/40 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            The pipeline
          </div>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Move humans, not spreadsheets.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every stage triggers the right thing — notifications, calendar invites,
            template emails — so the pipeline runs even when you're deep in interviews.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {cols.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-card p-3">
                <div className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${c.tone}`}>
                  <span>{c.name}</span>
                  <span className="tabular-nums opacity-70">{c.count}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {cards[c.name].map((k) => (
                    <div
                      key={k.name}
                      className="rounded-lg border border-border bg-background p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{k.name}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                          {k.fit}%
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{k.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features({ className = "" }: { className?: string }) {
  const f = [
    { t: "Resume parsing", d: "PDF/DOCX → structured JSON via LLM, validated & stored." },
    { t: "Skill-vector scoring", d: "Weighted cosine similarity. Explainable, tunable, fast." },
    { t: "Kanban pipeline", d: "Applied → Offered, with drag-and-drop and audit trail." },
    { t: "Interview scheduling", d: "Google Calendar sync + Resend email notifications." },
    { t: "Saved searches", d: "Alerts on new roles that match your vector above a threshold." },
    { t: "Premium listings", d: "Razorpay-powered boosts, subscriptions and agency invoices." },
  ];
  return (
    <section className={`border-b border-border ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Everything in the box
        </div>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
          A full hiring stack, minus the enterprise sludge.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {f.map((x, i) => (
            <div key={x.t} className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-foreground/30">
              <div className="mb-4 h-8 w-8 rounded-md bg-foreground transition-all duration-300 group-hover:scale-110" />
              <div className="font-serif text-xl text-foreground">{x.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ className = "" }: { className?: string }) {
  const tiers = [
    {
      n: "Candidate",
      p: "Free",
      s: "Forever",
      f: ["Unlimited applications", "Fit scores on every job", "Kanban tracker", "Basic salary insights"],
      cta: "Create profile",
      dark: false,
    },
    {
      n: "Recruiter",
      p: "₹1,999",
      s: "/mo · billed monthly",
      f: ["10 active job posts", "Ranked applicant lists", "Pipeline + scheduling", "Email templates"],
      cta: "Start hiring",
      dark: true,
    },
    {
      n: "Agency",
      p: "Custom",
      s: "Talk to us",
      f: ["Unlimited posts + seats", "Client invoicing (Razorpay)", "White-label pipelines", "Priority support"],
      cta: "Contact sales",
      dark: false,
    },
  ];
  return (
    <section id="pricing" className={`border-b border-border bg-secondary/40 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</div>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground md:text-5xl">
              Honest tiers. No hidden per-seat math.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Test mode Razorpay is wired in. Flip to production when you're ready.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.n}
              className={`flex flex-col rounded-2xl border p-8 ${
                t.dark
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <div className="text-sm font-semibold uppercase tracking-widest opacity-70">
                {t.n}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl">{t.p}</span>
                <span className="text-sm opacity-70">{t.s}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {t.f.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        t.dark ? "bg-[oklch(0.88_0.22_130)]" : "bg-foreground"
                      }`}
                    />
                    {x}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition-all duration-300 ${
                  t.dark
                    ? "bg-[oklch(0.88_0.22_130)] text-foreground hover:scale-105 hover:shadow-lg hover:opacity-90"
                    : "bg-foreground text-background hover:scale-105 hover:shadow-lg hover:opacity-90"
                }`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ className = "" }: { className?: string }) {
  return (
    <section className={`border-b border-border ${className}`}>
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-3xl font-serif text-5xl leading-[1.05] text-foreground md:text-6xl">
          Hire on <span className="italic">fit</span>, not on how well someone
          reverse-engineered your job post.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#" className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg">
            Post your first job — free
          </a>
          <a href="#" className="rounded-full border border-foreground/20 bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:scale-105 hover:border-foreground/40 hover:shadow-lg">
            Upload your resume
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2 text-lg font-black">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-background text-foreground text-xs">◆</span>
            Fitboard
          </div>
          <p className="mt-4 max-w-sm text-sm text-background/60">
            Skill-vector matching for the modern job market. Built on Next.js, Prisma,
            Neon Postgres and a healthy suspicion of keyword search.
          </p>
        </div>
        {[
          { h: "Product", l: ["Matching", "Pipeline", "Parsing", "Integrations"] },
          { h: "Company", l: ["About", "Careers", "Contact", "Press"] },
          { h: "Legal", l: ["Terms", "Privacy", "Security", "DPA"] },
        ].map((c) => (
          <div key={c.h}>
            <div className="text-xs uppercase tracking-widest text-background/50">{c.h}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {c.l.map((x) => (
                <li key={x}>
                  <a href="#" className="text-background/80 hover:text-background">{x}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-background/50">
          <span>© {new Date().getFullYear()} Fitboard.</span>
          <span className="font-mono">v_c · v_j / ‖v_c‖‖v_j‖</span>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground [font-family:'Inter',ui-sans-serif,system-ui,sans-serif] [--font-serif:'Instrument_Serif',ui-serif,Georgia,serif] [&_.font-serif]:[font-family:var(--font-serif)]">
      <Nav />
      <main>
        <Hero />
        <HowItWorks className="animate-slide-up" />
        <Roles className="animate-slide-up" />
        <Pipeline className="animate-slide-up" />
        <Features className="animate-slide-up" />
        <Pricing className="animate-slide-up" />
        <CTA className="animate-slide-up" />
      </main>
      <Footer />
    </div>
  );
}
