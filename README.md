<img width="70" src="https://raw.githubusercontent.com/RanitManik/lucide-note/refs/heads/main/apps/web/public/logo.svg" alt="Lume Notes Logo" />

# Lume Notes

A modern, full-stack notes app for organizations. Built with real-time collaboration, AI features, and secure multi-tenancy.

> [!NOTE]
> This is a project for learning and experimentation. Use it as a reference or a starting point for your own apps.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.4.1-blue)](https://pnpm.io/)

---

## 🚀 Quick Start

### 1. Setup

```bash
git clone https://github.com/RanitManik/lucide-note.git
cd lucide-note
pnpm install
```

### 2. Configure

Copy `.env.example` in `apps/web` to `.env` and fill in your details (Database, NextAuth, OAuth keys).

### 3. Run

```bash
pnpm db:setup  # Migrates and seeds the database
pnpm dev       # Starts the app at http://localhost:3000
```

---

## ✨ Main Features

- **Real-Time Editing**: Edit notes with others instantly using Liveblocks and Yjs.
- **Organization-Focused**: Isolated data for different teams (Multi-tenancy).
- **AI Assistant**: Chat with your notes and summarize documents.
- **Smart Folders**: Keep everything organized with nested folders and tags.
- **Rich Editor**: Professional writing experience with TipTap.

---

## 📚 Documentation

Detailed guides for all major features:

### Core Features

- [User Authentication](docs/user_authentication.md) — How we handle login and security.
- [Rich Text Editor](docs/rich_text_editor.md) — Our professional editing experience.
- [Slash Commands](docs/slash_commands.md) — Faster editing and note linking with `/`.
- [Real-Time Collaboration](docs/realtime_collaboration.md) — Character-by-character syncing.
- [AI Assistant](docs/aiassistant.md) — How AI helps you write and search.

### Organization & Management

- [Folders & Navigation](docs/folder_location.md) — Managing your workspace.
- [Nested Folders](docs/nested_folders.md) — Deeply organized note structures.
- [Tags & Metadata](docs/tags_and_sorting.md) — Sorting and finding what you need.
- [Note Sharing](docs/note_sharing.md) — Collaborating with teammates.

### Tools & Exports

- [PDF Export](docs/pdf_export.md) — Saving your notes as high-quality PDFs.
- [Chat with PDF](docs/chat_with_pdf.md) — Analyzing PDF content with AI.
- [Keyboard Shortcuts](docs/keyboard_shortcuts.md) — Move faster with shortcuts.

### Technical & System

- [API Rate Limiting](docs/api_rate_limiting.md) — Keeping the service stable and secure.
- [Deep Search](docs/deepsearch.md) — How our advanced search engine works.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS.
- **Backend**: PostgreSQL, Prisma ORM, NextAuth-v5.
- **Sync**: Liveblocks, Yjs.
- **Testing**: Jest, Playwright.

---

## 📄 License

MIT — Build something great!

<div align="center">Built for creators and teams.</div>
