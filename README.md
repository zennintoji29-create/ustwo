# UsTwo 💗 — Two hearts, one little world

> *A private, adorable, real-time multiplayer couples' gaming application and digital world designed specifically for two people to connect, play games, answer questions, challenge each other, and collect memories together across the internet.*

---

## 🌸 Table of Contents

1. [Features & Games Overview](#-features--games-overview)
2. [Tech Stack](#-tech-stack)
3. [Architecture & Real-Time Sync](#-architecture--real-time-sync)
4. [Getting Started Locally](#-getting-started-locally)
5. [Supabase Setup & Database Migration](#-supabase-setup--database-migration)
6. [Deploying to Vercel](#-deploying-to-vercel)
7. [Row Level Security & Privacy Model](#-row-level-security--privacy-model)

---

## 🎮 Features & Games Overview

### 1. Strictly Two-Player Private Rooms
- **Instant Room Codes**: One partner creates an encrypted room and receives a unique code (e.g. `US-8K2Q`) or one-click shareable invitation link.
- **Strict Capacity Enforcer**: A PostgreSQL database trigger strictly caps membership to 2 partners. No public rooms or third-party eavesdropping.
- **Real-Time Presence**: Live online badge, partner reconnecting status, and mutual ready checks.
- **Session Recovery**: Refreshing your browser or temporarily losing Wi-Fi recovers the exact active turn and score without destroying the game.

### 2. Complete 12 Playable Games
Every game is fully playable with synchronized turns, scores, and interactive mechanics:

| Game | Description & Mechanics |
| :--- | :--- |
| **🧠 Memory Match** | 4 difficulty levels (4, 8, 12, 18 pairs). Take turns flipping cute cards (strawberries, cats, boba, cupcakes). Correct pairs score points and grant a bonus turn. |
| **💗 Tic-Tac-Toe: Love Edition** | Hearts vs. Stars classic strategy with real-time board sync, animated victory states, and rematch flow. |
| **💕 How Well Do You Know Me?** | Target partner writes their honest answer secretly; guessing partner predicts it. Simultaneous reveal and points award. |
| **🎀 Truth or Dare** | Filterable by romantic, cute, funny, or deep categories. Accept challenges or skip. Add custom cards to the couple deck! |
| **🤔 Would You Rather?** | Both partners vote privately on cute dilemmas. Simultaneous reveal calculates your Couple Harmony score. |
| **🎯 Guess My Answer** | One partner secretly selects from 4 choices; the other predicts their choice. Instant verification and score tracking. |
| **🎨 Draw & Guess** | Real-time synchronized HTML5 canvas with custom colors, eraser, secret word prompt, countdown, and guess verification. |
| **😂 Who Is More Likely To...?** | Vote on hilarious couple scenarios (e.g. "Who falls asleep 10 minutes into a movie?"). Reveal votes together. |
| **⚡ Rapid Fire** | 10-second synchronized countdown timer. Both type quick answers and compare results. |
| **😭 Emoji Decoder** | Decode romantic, pop culture, and couple phrases written exclusively in emojis. Clue hint system included. |
| **💌 Secret Questions** | Deep questions placed into private lockboxes. Answers unlock only when both partners choose to reveal! |
| **📸 Our Memory Lane** | Interactive quiz where partners test each other on where and when their most cherished memories happened. |

### 3. Our Little Corner (Shared Activities)
- **Shared Bucket List**: Add romantic dreams, mark them completed with celebratory confetti, and filter by categories.
- **Daily Question & Streak**: A new question every day to spark intimate conversations and build your relationship streak.
- **Love Notes Mailbox**: Digital stationery (Blush, Lavender, Peach, Mint) with cute stickers (Ribbons, Teddy Bears, Sparkles) and favoriting.
- **Couple Calendar**: Track anniversaries, birthdays, and date nights with automatic countdowns.
- **Virtual Gift Box**: Send digital bouquets, teddy bears, chocolates, and cupcakes with personalized notes.

### 4. Kawaii Aesthetic & Sound System
- Soft pastel palette: Baby Pink (`#FFD6E7`), Blush (`#F7B8D0`), Lavender (`#E8DDFB`), Cream (`#FFF7EF`), and high-contrast text (`#514454`).
- Custom SVG kawaii avatars (Bunny, Kitty, Bear, Pup, Fox, Panda).
- Web Audio API synthesizer for cheerful pops, card flips, and fanfare with an accessible sound toggle.
- Mobile-first responsive layout with compact thumb bottom navigation.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS with custom Kawaii design system tokens
- **Animations**: Framer Motion
- **Backend & Database**: Supabase (PostgreSQL 16)
- **Real-Time Engine**: Supabase Realtime (Presence & Broadcast Channels)
- **Security**: Supabase Row Level Security (RLS)
- **Audio Engine**: Web Audio API Sound Synthesizer (zero external sound file 404s)

---

## 🚀 Getting Started Locally

### 1. Clone & Install
```bash
git clone <repo-url>
cd ustwo
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

*(Note: If you run locally without Supabase keys, UsTwo automatically runs in graceful local mode using browser BroadcastChannel so you can test two tabs on the same computer right away!)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Supabase Setup & Database Migration

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the file `supabase/migrations/20261031_init_ustwo.sql` from this repository.
4. Copy the entire contents and run it in the SQL Editor.
5. In your Supabase dashboard under **Database $\to$ Publications**, confirm `supabase_realtime` has the following tables enabled:
   - `room_members`
   - `game_sessions`
   - `love_notes`
   - `virtual_gifts`
   - `daily_answers`
   - `bucket_list_items`
   - `calendar_events`

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub.
2. Sign in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `ustwo` repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL, e.g. `https://ustwo.vercel.app`)
5. Click **Deploy**. Your couple world is live!

---

## 🔒 Row Level Security & Privacy Model

- **Room Authorization**: RLS policies verify `public.is_room_member(target_room_id)` on every query.
- **Zero Third-Party Leaks**: Only the 2 members inside a room can view game sessions, moves, love notes, or memories.
- **Server-Authoritative**: Database triggers enforce capacity and prevent turn tampering.
