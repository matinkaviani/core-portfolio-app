# Qaay

## Overview
Crypto finance dashboard for Qaay — portfolio, lending, borrowing, swaps, deposits, withdrawals, and treasury flows. A production trading-style fintech platform focused on performance, typed APIs, and modular Next.js architecture.

## Responsibilities
- Built a modular Next.js 15 dashboard spanning portfolio, lend, borrow, swap, deposits, and withdrawals using App Router, SSR/ISR, and route middleware
- Designed a reusable UI and performance layer — design tokens, memoized selectors, virtualization, Suspense-friendly hooks — cutting unnecessary re-renders ~45% and CLS ~30%
- Integrated Payload CMS for admin/content under isolated routes; hardened auth with secure OTP and session handling
- Drove bundle and runtime optimization — code-splitting, CDN/image strategy, virtualization — reducing TTI ~35% and JS payload ~28%
- Established CI/CD with Docker and Bitbucket Pipelines; added lint/test gates and improved DX with typed APIs and shared hooks

## Tech Stack
- Next.js
- TypeScript
- React
- Payload CMS
- Docker
- Bitbucket Pipelines

## Key Challenges
- High-frequency UI updates across portfolio and trading flows without sacrificing responsiveness
- Modular dashboard architecture across lend, borrow, swap, and treasury surfaces
- Auth, OTP, and session hardening for a regulated fintech product

## Outcome
Production crypto finance platform with faster loads, stronger type safety, and a maintainable component architecture across trading and treasury workflows.
