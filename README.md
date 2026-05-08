# SpaceSync Dashboard 🛸

A real-time dashboard tracking the ISS, displaying news, and featuring an AI chatbot.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```
Then edit `.env` and add your keys:
- `VITE_NEWS_API_KEY` — from https://newsapi.org (free account)
- `VITE_AI_TOKEN` — from https://huggingface.co/settings/tokens

3. **Run dev server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add env vars in Vercel dashboard under Settings > Environment Variables.

## Features
- 🛸 Live ISS tracking with Leaflet map
- 📈 Speed history chart (Chart.js)
- 👨‍🚀 People in space list
- 📰 Technology & Science news (NewsAPI)
- 🍩 News distribution chart
- 🤖 AI chatbot (Mistral-7B via HuggingFace)
- 🌙 Dark/Light mode
- 📱 Fully responsive
