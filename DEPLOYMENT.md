# 🚀 VibeRoom — Complete Deployment & Mobile Phone Guide

VibeRoom is a mobile-first social music streaming and real-time listening platform.
This guide walks you through deploying VibeRoom to the cloud so you and your friends can use it anywhere on your phones, 24/7, for free.

---

## ☁️ Option 1: Deploy Free to Render (Recommended — 100% Free 24/7)

Render provides free hosting for fullstack Node.js + WebSocket + React apps.

### Step 1: Initialize Git and Push to GitHub
Open your terminal in `viberoom` and run:
```bash
git init
git add .
git commit -m "feat: VibeRoom initial release"
git branch -M main
```

Create a new repository on [GitHub](https://github.com/new) (e.g. named `viberoom`), then link and push:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/viberoom.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [https://render.com](https://render.com) and sign up / log in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Choose **Build and deploy from a Git repository** $\rightarrow$ select your `viberoom` repository.
4. Render will automatically read the settings, or you can enter:
   - **Name**: `viberoom` (or any custom name)
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Deploy Web Service**!

Render will install dependencies, build the client production bundle, and launch the server.
In 2-3 minutes, you will receive a permanent live HTTPS link:
```
https://viberoom-xxxx.onrender.com
```

---

## 🚂 Option 2: Deploy to Railway.app

1. Go to [https://railway.app](https://railway.app) and log in with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your `viberoom` repository.
4. Railway will automatically detect the `Dockerfile` or `package.json` and start building.
5. In your project settings, click **Generate Domain** to get your public URL (e.g., `https://viberoom.up.railway.app`).

---

## 🐳 Option 3: Deploy with Docker / Self-Hosting (VPS, Coolify, Portainer)

A production-ready multi-stage `Dockerfile` and `docker-compose.yml` are included.

To run locally or on any Linux VPS:
```bash
docker compose up -d
```
Your app will be live on `http://YOUR_SERVER_IP:4000`.

---

## ⚡ Option 4: Instant Public URL via Free Tunnel (No Cloud Account Required)

If you want an instant secure HTTPS link for your phone right now from your PC:

Run either of these commands in your terminal:
```bash
npx untun@latest tunnel 4000
```
or
```bash
npx localtunnel --port 4000
```
This gives you an instant public HTTPS address (e.g. `https://viberoom.loca.lt`) that you can open on any phone anywhere!

---

## 📱 How to Install VibeRoom on Your Phone (PWA)

VibeRoom is designed as a **Progressive Web App (PWA)** with native touch UI:

### On iPhone (iOS Safari):
1. Open your live VibeRoom URL in Safari.
2. Tap the **Share** button (box with an upward arrow at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**.
5. VibeRoom will now appear on your home screen with its dark icon and launch in full-screen native mode without browser bars!

### On Android (Chrome):
1. Open your live VibeRoom URL in Chrome.
2. Tap the three dots menu (⋮) in the top-right corner.
3. Tap **"Install App"** (or **"Add to Home screen"**).
4. Tap **Install**.

---

## 🎧 Mobile Audio Note
Mobile operating systems (iOS and Android) require user interaction before playing audio or video.
When opening the app on your phone, simply tap any track or the play button to start listening!
