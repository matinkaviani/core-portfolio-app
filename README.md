# CORE — Portfolio OS

An interactive portfolio that behaves like a lightweight desktop OS: terminal, AI assistant, projects, experience, résumé, contact, and more — all in the browser.

Deployed on [Cloudflare Workers](https://developers.cloudflare.com/workers/) via [OpenNext](https://opennext.js.org/cloudflare).

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env` and fill in secrets for local features (Groq, Resend, Turnstile).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm build:cf` | OpenNext Cloudflare build |
| `pnpm preview` | Local Cloudflare preview (wrangler) |
| `pnpm deploy` | Build and deploy to Cloudflare |

## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS
- Framer Motion, AI SDK (Groq)
- Cloudflare Workers, Durable Objects (live cursors), Turnstile, Resend
