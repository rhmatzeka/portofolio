# RahmatDev Portfolio

Personal portfolio for Rahmat Eka Satria, built with React, Vite, Vercel serverless functions, animated UI sections, admin-managed portfolio content, contact email delivery, live presence, wallet donation, and an AI assistant.

## Features

- Responsive portfolio sections for hero, about, projects, certificates, contact, and footer.
- Admin dashboard at `/admin` for managing portfolio content without editing React files.
- Project management with separate `Add Project` and `All Projects` views.
- Project display ordering through the admin dashboard, so projects can be positioned on the main portfolio page.
- Image, GIF, and video project media support.
- Certificate management from the admin dashboard.
- Contact form backed by Resend.
- AI assistant backed by Groq.
- Live activity/presence cards using GitHub public events and optional Discord/Lanyard status.
- Crypto tip modal and MetaMask ETH donation flow.

## Tech Stack

- React
- Vite
- Framer Motion
- GSAP
- Three.js / React Three Fiber
- Ethers
- Vercel serverless functions

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Admin Dashboard

Open `/admin` and log in with `ADMIN_PASSWORD`.

The Projects area has two views:

- `Add Project`: create or edit a project, including title, category, descriptions, tech stack, media, links, and display order.
- `All Projects`: view all projects, edit/delete them, and update each project's `Position` to control its order on the main portfolio dashboard.

Portfolio content is stored in `public/content.json` for local development. In production on Vercel, configure GitHub storage so admin changes can be persisted.

## Environment Variables

```env
ADMIN_PASSWORD=

GITHUB_REPO=
GITHUB_TOKEN=
GITHUB_BRANCH=main

RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=

GROQ_API_KEY=
GROQ_MODEL=

DISCORD_USER_ID=
```

## Deployment Notes

Vercel deployments should include the environment variables above as needed. Admin uploads and content writes in production require `GITHUB_REPO` and `GITHUB_TOKEN`, because Vercel serverless filesystems are read-only at runtime.
