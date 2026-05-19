# 🧠 AI Memory Companion

> An AI-powered personal memory platform designed to help users capture, organize, and explore their life through intelligent conversations and insights.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange)
![PWA](https://img.shields.io/badge/PWA-Mobile--Ready-purple)
![AI Powered](https://img.shields.io/badge/AI-Gemini-green)

---

# 🌍 Vision

AI Memory Companion aims to become a personal AI-powered second brain — a place where users can store, revisit, and interact with their life experiences naturally.

The platform combines modern AI, memory organization, and conversational interfaces to create a living digital memory experience.

---

# 🧠 Overview

AI Memory Companion is a modern web application and installable PWA that transforms personal memories into an intelligent, searchable timeline.

Users can store:

- Notes and written memories
- Images and photos
- Audio recordings
- AI-generated summaries and insights

The platform uses artificial intelligence to analyze memories, extract meaningful information, and allow natural language interaction with personal history.

---

# ✨ Features

## 📚 Smart Memory Timeline

- Chronological memory organization
- Grouped by days, months, and years
- Modern timeline experience
- Elegant memory cards
- Responsive mobile-first layout

---

## 🤖 AI Memory Analysis

Each memory is automatically processed with AI to generate:

- Summaries
- Keywords
- Entities (people, places, events)
- Emotional tone
- Contextual insights

---

## 💬 Natural Language Search

Users can ask questions like:

- “What did I do in June?”
- “When was my last trip?”
- “Show memories about Medellín”
- “Summarize my year”

The AI retrieves relevant memories and generates contextual responses.

---

## 🖼️ Media Uploads

- Image uploads
- Audio uploads and recordings
- Browser file access permissions
- Supabase Storage integration
- Media previews
- Modern upload experience

---

## 📊 AI Insights Dashboard

Generate intelligent life analytics such as:

- Activity patterns
- Emotional trends
- Habit tracking
- Weekly and monthly summaries

---

## 🔐 Authentication

- Firebase Authentication
- Email & password login
- Persistent sessions
- Secure user access

---

## 📱 Progressive Web App (PWA)

- Installable on iPhone and Android
- Mobile-first experience
- App-like navigation
- Optimized for touch devices

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Backend & Database

- Firebase Authentication
- Firestore Database
- Supabase Storage (images & audio)

---

## AI

- Google Gemini API

---

## Deployment

- Vercel

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ai-memory-companion
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase (Auth + Firestore)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# 🔥 Firebase Setup

Create a project in Firebase Console and enable the following services:

---

## Authentication

Enable:

- Email/Password provider

---

## Firestore Database

Create Firestore Database in:

- Production mode

Recommended regions:

- `us-central1`
- `southamerica-east1`

---

## Supabase Storage

See `supabase/STORAGE_SETUP.md` for bucket setup (`memories`, public read).

---

## Firestore Indexes

Create a composite index:

| Collection | Fields |
|---|---|
| memories | userId (Asc) + createdAt (Desc) |

---

# 💻 Running the Project

## Development

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Production Build

```bash
npm run build
npm run start
```

---

# 📂 Project Structure

```txt
src/
├── app/
│   ├── (auth)/
│   ├── (app)/
│   └── api/
├── components/
├── services/
├── firebase/
├── ai/
├── hooks/
├── lib/
├── store/
├── styles/
└── types/
```

---

# 🧩 Core Application Flow

## Creating Memories

1. User creates a memory
2. Content is uploaded to Firebase
3. AI analyzes the memory
4. Metadata is generated
5. Memory is stored in Firestore

---

## AI Chat

1. User asks a question
2. Relevant memories are retrieved
3. Context is sent to Gemini
4. AI generates a natural response

---

# 🎨 Design Philosophy

The UI is inspired by:

- Apple
- Notion
- Modern AI products

Focus areas:

- Minimalism
- Smooth animations
- Mobile-first UX
- Clean typography
- Elegant spacing
- Soft shadows
- AI-first experience

---

# 📱 Progressive Web App

AI Memory Companion works as a modern installable PWA.

Users can:

- Install it on iPhone and Android
- Add it to the home screen
- Use it like a native application
- Access a fully responsive mobile experience

---

## iPhone Installation

1. Open the app in Safari
2. Tap the **Share** button
3. Select **Add to Home Screen**

---

# ☁️ Deployment

The project is optimized for deployment on Vercel.

## Deployment Steps

1. Import repository into Vercel
2. Add environment variables
3. Deploy the application

---

# 🔒 Security Notes

- `GEMINI_API_KEY` must remain server-side only
- Never expose private API keys to the client
- Validate uploaded file types and sizes
- Use Firebase Security Rules in production

---

# 📌 Current Status

The project is actively evolving and focused on building a premium AI-first memory experience for web and mobile users.

Future plans include:

- Advanced AI memory clustering
- Semantic search
- Voice memory assistant
- AI-generated life summaries
- Smart recommendations
- Cross-device sync improvements

---

# 📄 License

Private project — personal use only.