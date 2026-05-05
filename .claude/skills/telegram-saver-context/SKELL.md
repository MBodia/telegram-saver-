---
name: telegram-saver-context
description: Context and conventions for Telegram Saver SaaS project. Use when working on any file in this project — components, pages, API routes, bot code, database queries. Applies to all frontend, backend, and Telegram bot tasks.
---

# Telegram Saver — Project Context

## Stack
- Next.js 16 (App Router) + TypeScript + TailwindCSS
- Supabase (PostgreSQL + Auth + Storage)
- Telegram Bot via grammY (separate project)
- Anthropic Claude API (Haiku) for AI summaries
- Vercel (site hosting), Railway (bot hosting)

## Database Tables
- profiles (user accounts, linked to Telegram)
- saved_items (links, text, forwards, photos, PDFs — with is_favorite)
- tags, item_tags (tagging system)
- media_files (images and documents)

## Auth
- Telegram Login Widget + bot /login command with 6-digit code
- Cookie session (ts_session, 30 days)

## UI Conventions
- Language: Ukrainian (all user-facing text)
- Style: clean, minimal, functional
- Mobile-first responsive design
- All pages under /dashboard are protected (require auth)

## Code Conventions
- Components in src/components/
- API routes in src/app/api/
- Use server actions where possible
- Always use TypeScript strict mode
- Comments in English, UI text in Ukrainian
- Handle errors gracefully with user-friendly messages in Ukrainian