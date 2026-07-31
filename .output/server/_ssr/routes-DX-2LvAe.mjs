import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DX-2LvAe.js
var import_jsx_runtime = require_jsx_runtime();
function Nav() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#",
					className: "flex items-center gap-2 text-lg font-black tracking-tight text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-7 w-7 place-items-center rounded-md bg-foreground text-background text-xs",
						children: "◆"
					}), "Fitboard"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden gap-8 text-sm font-medium text-muted-foreground md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#how",
							className: "hover:text-foreground",
							children: "How it works"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#roles",
							className: "hover:text-foreground",
							children: "For you"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#pipeline",
							className: "hover:text-foreground",
							children: "Pipeline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#pricing",
							className: "hover:text-foreground",
							children: "Pricing"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hidden text-sm font-medium text-foreground/80 hover:text-foreground md:inline",
						children: "Sign in"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg hover:opacity-90",
						children: "Post a job →"
					})]
				})
			]
		})
	});
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative overflow-hidden border-b border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-br from-background via-background to-[oklch(0.88_0.22_130/0.05)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-20 lg:grid-cols-12 lg:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.18_35)]" }), "Now parsing resumes with structured LLM extraction"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-6 font-serif text-5xl leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-[88px]",
						children: [
							"Job matching that",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "italic",
								children: " actually "
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative inline-block",
								children: ["fits.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -bottom-2 left-0 right-0 h-3 bg-[oklch(0.88_0.22_130)] -z-10" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-lg text-muted-foreground",
						children: "Fitboard turns resumes into structured skill vectors and scores every candidate–job pairing with weighted cosine similarity — so recruiters stop guessing and candidates stop shouting into keyword voids."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							className: "rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg hover:opacity-90",
							children: "I'm hiring"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							className: "rounded-full border border-foreground/20 bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:scale-105 hover:border-foreground/40 hover:bg-secondary",
							children: "I'm job hunting"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								n: "94%",
								l: "avg. fit accuracy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								n: "4.2s",
								l: "resume → parsed JSON"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								n: "0",
								l: "keyword-only searches"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MatchCard, {})
			})]
		})]
	});
}
function Stat({ n, l }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "font-serif text-3xl text-foreground",
		children: n
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs uppercase tracking-widest text-muted-foreground",
		children: l
	})] });
}
function MatchCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative animate-scale-in",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-4 -z-10 rounded-3xl bg-[oklch(0.88_0.22_130)] opacity-30 blur-2xl animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-card p-6 shadow-[0_20px_60px_-20px_oklch(0.18_0.02_250/0.25)] transition-all duration-300 hover:shadow-[0_30px_80px_-20px_oklch(0.18_0.02_250/0.35)] hover:scale-[1.02]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Match report"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-serif text-xl text-foreground",
						children: "Priya S. → Senior Backend Eng."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-16 w-16 place-items-center rounded-full border-4 border-[oklch(0.88_0.22_130)] font-serif text-xl font-bold text-foreground",
						children: "87%"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-3",
					children: [
						{
							name: "TypeScript",
							weight: "must",
							score: 98
						},
						{
							name: "PostgreSQL",
							weight: "must",
							score: 92
						},
						{
							name: "Prisma ORM",
							weight: "must",
							score: 88
						},
						{
							name: "Next.js",
							weight: "nice",
							score: 76
						},
						{
							name: "LLM APIs",
							weight: "nice",
							score: 71
						}
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: s.weight === "must" ? "rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] font-semibold uppercase text-background" : "rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground",
								children: s.weight
							}), s.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tabular-nums text-muted-foreground",
							children: s.score
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5 h-1.5 w-full rounded-full bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-foreground",
							style: { width: `${s.score}%` }
						})
					})] }, s.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "cosine similarity · weighted vectors" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono",
						children: "v_c · v_j / ‖v_c‖‖v_j‖"
					})]
				})
			]
		})]
	});
}
function HowItWorks({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "how",
		className: `border-b border-border bg-secondary/40 ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-24",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
					children: "The algorithm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 max-w-2xl font-serif text-4xl leading-tight text-foreground md:text-5xl",
					children: "From messy PDF to ranked shortlist in four moves."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: "No black boxes. Every score can be broken down to which skills matched, which didn't, and how much each was weighted."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						k: "01",
						t: "Upload",
						d: "Drop a PDF or DOCX. We pull the text with pdf-parse / mammoth — no manual form filling."
					},
					{
						k: "02",
						t: "Parse",
						d: "An LLM extracts skills, experience and education into validated JSON, stored in Postgres."
					},
					{
						k: "03",
						t: "Vectorize",
						d: "Both job requirements and candidate profiles become weighted skill vectors — must-haves outweigh nice-to-haves."
					},
					{
						k: "04",
						t: "Rank",
						d: "Cosine similarity produces a % fit score. Applicants get sorted, candidates get personal recs."
					}
				].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative bg-background p-8 transition-all duration-300 hover:bg-card hover:-translate-y-1",
					style: { animationDelay: `${i * 100}ms` },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-xs text-muted-foreground",
							children: s.k
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 font-serif text-2xl text-foreground",
							children: s.t
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: s.d
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-0 h-0.5 w-0 bg-foreground transition-all duration-300 group-hover:w-full" })
					]
				}, s.k))
			})]
		})
	});
}
function Roles({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "roles",
		className: `border-b border-border ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-7xl grid-cols-1 gap-0 divide-border md:grid-cols-2 md:divide-x",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-10 lg:p-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
						children: "For candidates"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-4 font-serif text-4xl text-foreground",
						children: "One resume. A hundred honest matches."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-8 space-y-4 text-sm",
						children: [
							"See a % fit score before you apply — no more spraying resumes",
							"Personalised job feed based on your extracted skill vector",
							"Track every application on a Kanban dashboard",
							"Salary insights and saved-search alerts"
						].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3 text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-[oklch(0.88_0.22_130)]" }), x]
						}, x))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-semibold text-foreground transition-all duration-300 hover:border-b-2 hover:translate-x-1",
						children: "Build my profile →"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-foreground p-10 text-background lg:p-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-[0.2em] text-background/60",
						children: "For employers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-4 font-serif text-4xl",
						children: "Post once. Get ranked applicants, not stacks."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-8 space-y-4 text-sm",
						children: [
							"Structured job forms: must-have vs nice-to-have skills",
							"Applicants pre-ranked by objective fit score",
							"Kanban pipeline: Applied → Reviewed → Interviewed → Offered",
							"Calendar-synced interview scheduling + email alerts"
						].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-[oklch(0.88_0.22_130)]" }), x]
						}, x))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "mt-10 inline-flex items-center gap-2 border-b border-background pb-1 text-sm font-semibold transition-all duration-300 hover:border-b-2 hover:translate-x-1",
						children: "Post a role →"
					})
				]
			})]
		})
	});
}
function Pipeline({ className = "" }) {
	const cols = [
		{
			name: "Applied",
			count: 42,
			tone: "bg-secondary"
		},
		{
			name: "Reviewed",
			count: 18,
			tone: "bg-[oklch(0.94_0.06_95)]"
		},
		{
			name: "Interviewed",
			count: 7,
			tone: "bg-[oklch(0.92_0.12_130)]"
		},
		{
			name: "Offered",
			count: 2,
			tone: "bg-foreground text-background"
		}
	];
	const cards = {
		Applied: [
			{
				name: "Arjun M.",
				role: "Frontend",
				fit: 71
			},
			{
				name: "Sara K.",
				role: "Frontend",
				fit: 68
			},
			{
				name: "Ravi P.",
				role: "Frontend",
				fit: 64
			}
		],
		Reviewed: [{
			name: "Nina D.",
			role: "Frontend",
			fit: 82
		}, {
			name: "Omar B.",
			role: "Frontend",
			fit: 79
		}],
		Interviewed: [{
			name: "Priya S.",
			role: "Frontend",
			fit: 87
		}],
		Offered: [{
			name: "Jules T.",
			role: "Frontend",
			fit: 93
		}]
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "pipeline",
		className: `border-b border-border bg-secondary/40 ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-24",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
						children: "The pipeline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-serif text-4xl leading-tight text-foreground md:text-5xl",
						children: "Move humans, not spreadsheets."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-muted-foreground",
						children: "Every stage triggers the right thing — notifications, calendar invites, template emails — so the pipeline runs even when you're deep in interviews."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 overflow-hidden rounded-2xl border border-border bg-background p-4 shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: cols.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${c.tone}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: c.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums opacity-70",
								children: c.count
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 space-y-2",
							children: cards[c.name].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-background p-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: k.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground",
										children: [k.fit, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: k.role
								})]
							}, k.name))
						})]
					}, c.name))
				})
			})]
		})
	});
}
function Features({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: `border-b border-border ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
					children: "Everything in the box"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 max-w-3xl font-serif text-4xl leading-tight text-foreground md:text-5xl",
					children: "A full hiring stack, minus the enterprise sludge."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
					children: [
						{
							t: "Resume parsing",
							d: "PDF/DOCX → structured JSON via LLM, validated & stored."
						},
						{
							t: "Skill-vector scoring",
							d: "Weighted cosine similarity. Explainable, tunable, fast."
						},
						{
							t: "Kanban pipeline",
							d: "Applied → Offered, with drag-and-drop and audit trail."
						},
						{
							t: "Interview scheduling",
							d: "Google Calendar sync + Resend email notifications."
						},
						{
							t: "Saved searches",
							d: "Alerts on new roles that match your vector above a threshold."
						},
						{
							t: "Premium listings",
							d: "Razorpay-powered boosts, subscriptions and agency invoices."
						}
					].map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-foreground/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4 h-8 w-8 rounded-md bg-foreground transition-all duration-300 group-hover:scale-110" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-serif text-xl text-foreground",
								children: x.t
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: x.d
							})
						]
					}, x.t))
				})
			]
		})
	});
}
function Pricing({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "pricing",
		className: `border-b border-border bg-secondary/40 ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-24",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
					children: "Pricing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-serif text-4xl leading-tight text-foreground md:text-5xl",
					children: "Honest tiers. No hidden per-seat math."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: "Test mode Razorpay is wired in. Flip to production when you're ready."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12 grid grid-cols-1 gap-6 md:grid-cols-3",
				children: [
					{
						n: "Candidate",
						p: "Free",
						s: "Forever",
						f: [
							"Unlimited applications",
							"Fit scores on every job",
							"Kanban tracker",
							"Basic salary insights"
						],
						cta: "Create profile",
						dark: false
					},
					{
						n: "Recruiter",
						p: "₹1,999",
						s: "/mo · billed monthly",
						f: [
							"10 active job posts",
							"Ranked applicant lists",
							"Pipeline + scheduling",
							"Email templates"
						],
						cta: "Start hiring",
						dark: true
					},
					{
						n: "Agency",
						p: "Custom",
						s: "Talk to us",
						f: [
							"Unlimited posts + seats",
							"Client invoicing (Razorpay)",
							"White-label pipelines",
							"Priority support"
						],
						cta: "Contact sales",
						dark: false
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex flex-col rounded-2xl border p-8 ${t.dark ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold uppercase tracking-widest opacity-70",
							children: t.n
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-baseline gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-serif text-5xl",
								children: t.p
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm opacity-70",
								children: t.s
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-6 flex-1 space-y-3 text-sm",
							children: t.f.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${t.dark ? "bg-[oklch(0.88_0.22_130)]" : "bg-foreground"}` }), x]
							}, x))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#",
							className: `mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition-all duration-300 ${t.dark ? "bg-[oklch(0.88_0.22_130)] text-foreground hover:scale-105 hover:shadow-lg hover:opacity-90" : "bg-foreground text-background hover:scale-105 hover:shadow-lg hover:opacity-90"}`,
							children: t.cta
						})
					]
				}, t.n))
			})]
		})
	});
}
function CTA({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: `border-b border-border ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 py-24 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mx-auto max-w-3xl font-serif text-5xl leading-[1.05] text-foreground md:text-6xl",
				children: [
					"Hire on ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "italic",
						children: "fit"
					}),
					", not on how well someone reverse-engineered your job post."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap justify-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#",
					className: "rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg",
					children: "Post your first job — free"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#",
					className: "rounded-full border border-foreground/20 bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:scale-105 hover:border-foreground/40 hover:shadow-lg",
					children: "Upload your resume"
				})]
			})]
		})
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "bg-foreground text-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-lg font-black",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-7 w-7 place-items-center rounded-md bg-background text-foreground text-xs",
						children: "◆"
					}), "Fitboard"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-sm text-sm text-background/60",
					children: "Skill-vector matching for the modern job market. Built on Next.js, Prisma, Neon Postgres and a healthy suspicion of keyword search."
				})]
			}), [
				{
					h: "Product",
					l: [
						"Matching",
						"Pipeline",
						"Parsing",
						"Integrations"
					]
				},
				{
					h: "Company",
					l: [
						"About",
						"Careers",
						"Contact",
						"Press"
					]
				},
				{
					h: "Legal",
					l: [
						"Terms",
						"Privacy",
						"Security",
						"DPA"
					]
				}
			].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs uppercase tracking-widest text-background/50",
				children: c.h
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2 text-sm",
				children: c.l.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#",
					className: "text-background/80 hover:text-background",
					children: x
				}) }, x))
			})] }, c.h))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-background/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-background/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" Fitboard."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono",
					children: "v_c · v_j / ‖v_c‖‖v_j‖"
				})]
			})
		})]
	});
}
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground [font-family:'Inter',ui-sans-serif,system-ui,sans-serif] [--font-serif:'Instrument_Serif',ui-serif,Georgia,serif] [&_.font-serif]:[font-family:var(--font-serif)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, { className: "animate-slide-up" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Roles, { className: "animate-slide-up" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pipeline, { className: "animate-slide-up" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Features, { className: "animate-slide-up" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pricing, { className: "animate-slide-up" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CTA, { className: "animate-slide-up" })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { Index as component };
