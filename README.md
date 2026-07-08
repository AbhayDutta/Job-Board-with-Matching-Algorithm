# Fitboard - Job Matching Platform

A modern job matching platform that uses skill-vector algorithms to match candidates with jobs based on weighted cosine similarity. Built with TanStack Start, React, and Tailwind CSS.

## Features

- **Resume Parsing**: PDF/DOCX → structured JSON via LLM extraction
- **Skill-Vector Scoring**: Weighted cosine similarity for objective candidate-job matching
- **Kanban Pipeline**: Track applications from Applied → Offered
- **Interview Scheduling**: Calendar sync and email notifications
- **Real-time Matching**: Instant fit scores for every application

## Tech Stack

- **Framework**: TanStack Start (React SSR)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query
- **Routing**: TanStack Router (file-based)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/ui/    # Reusable UI components
├── routes/          # File-based routing
│   ├── __root.tsx   # Root layout
│   └── index.tsx     # Home page
├── styles.css       # Global styles and design system
├── router.tsx       # Router configuration
└── server.ts        # SSR entry point
```

## Routing

This project uses TanStack Start's file-based routing:

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/$id.tsx` | `/users/:id` (dynamic) |

## License

MIT
