# Foodly

A small, beautiful landing page for a food delivery app, built with [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it. The homepage lives at `app/page.tsx`.

## GitOps deployment (Vercel)

This repo is deployed with a GitOps workflow:

1. **CI** (`.github/workflows/ci.yml`) runs `npm run lint` and `npm run build` on every push and pull request against `main`, so broken code never reaches deploy.
2. **Vercel** is connected directly to this GitHub repository:
   - Every push to `main` triggers an automatic **production** deployment.
   - Every push to another branch or pull request gets its own **preview** deployment with a unique URL, posted back to the PR.
3. To connect a new Vercel project to this repo: go to [vercel.com/new](https://vercel.com/new), import `aksharma35/food-delivery-app`, keep the default Next.js build settings (`npm run build`, output auto-detected), and deploy. No extra configuration is required.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript
