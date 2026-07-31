# Product

## Register

brand

## Platform

web

## Users

Fitboard addresses two main user segments on the same platform:
- **Employers & Recruiters**: Hiring teams looking for qualified applicants with complex skill requirements, seeking to bypass the flood of unqualified applications.
- **Candidates & Job Seekers**: Professionals seeking roles that match their actual capabilities, tired of getting filtered out by simplistic keyword-matching ATS engines.

## Product Purpose

Fitboard is a modern job board built to replace traditional, broken keyword search with weighted cosine-similarity matching. It parses resumes into structured JSON vectors and instantly scores every candidate-job pairing, allowing both sides to interact transparently and transition into a functional Kanban-style hiring pipeline.

## Positioning

Algorithmic weighted matching (Cosine Similarity) instead of keyword voids or black boxes. Fitboard proves its value by showing exactly why and how well a candidate matches a job.

## Conversion & proof

- **Primary and secondary CTA**: 
  - Primary: "Upload your resume" (Candidates) and "Post a role" (Employers).
  - Secondary: "Build my profile" (Candidates) and "Start hiring" (Employers).
- **The line a visitor remembers after 10 seconds**: "Job matching that actually fits."
- **Belief ladder**:
  1. The standard application process (keyword stuffing, sorting, and manual scanning) is highly inefficient and inaccurate.
  2. A weighted, math-based fit score (weighted cosine similarity of skill vectors) is a far better representation of qualification than keyword frequency.
  3. Fitboard provides a clean, modern, and automated pipeline that turns messy documents into ordered shortlists effortlessly.
- **Proof on hand**:
  - Live interactive "Match Report" preview showing Priya S. matching a Senior Backend Engineer role at 87% with visual breakdowns of individual skill scores.
  - Transparent formula display: `v_c · v_j / ‖v_c‖‖v_j‖` (cosine similarity of weighted vectors).

## Brand Personality

Expert, confident, and precise. The brand feels editorial, structured, and premium rather than tech-playful or corporate-bland.

## Anti-references

- Overly rounded cards (`border-radius > 16px`) and buttons.
- Tiny uppercase tracked kicker/eyebrow text above every heading.
- Arbitrary grid patterns, diagonal stripe backgrounds, or hand-drawn SVGs.
- Text contrast failures (avoid light gray body copy; prioritize readability).

## Design Principles

1. **Algorithmic Clarity**: Expose the underlying matching logic visually. Show the math, the weights, and the skill tags clearly so the score feels earned.
2. **Editorial Restraint**: Prioritize spacious layouts, high typographic contrast, and a warm, structured editorial layout (using HSL/OKLCH colors).
3. **Physical Layout consistency**: Maintain solid borders, clear separations, and robust interactive states (hover feedback, cursor pointer) rather than generic shadows or blurs.

## Accessibility & Inclusion

- strict WCAG 2.1 AA text contrast compliance (minimum 4.5:1 for body and placeholder text).
- Responsive layouts with no horizontal scroll down to 375px.
- Focus rings visible for keyboard users.
- Support for prefers-reduced-motion in all reveal transitions.
