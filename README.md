# 🎧 VIBEROOM — Mobile-First Social Music Platform
> *"Music is better together."*

**VibeRoom** is a mobile-first social music streaming and real-time listening lounge built with **Node.js, TypeScript, Socket.IO, and React Native / Web**.

Inspired by premium digital music magazines and real-time collaborative lounges, VibeRoom departs from generic music apps:

```
Traditional Music Apps:
Find music → Listen → Leave

VibeRoom:
Find music → Invite someone → Synchronize → Chat → React → Create memories
```

---

## 🖤 Design System & Visual Direction
* **Color System**:
  * Pure Obsidian Background: `#08090B`
  * Primary Surface: `#111214`
  * Secondary Surface: `#18191B`
  * Primary Text: `#F5F5F3`
  * Secondary Text: `#9A9A9A`
  * Muted Text: `#666666`
  * Border: `#242424`
* **Editorial Typography**:
  * Stacked Serif Headings (`DM Serif Display` / `Instrument Serif`):
    ```
    LATE
    NIGHT
    VIBES
    ```
  * Clean UI sans-serif (`Inter`).
* **Dynamic Artwork Glow**:
  * Subtle, atmospheric dark vignette and radial tint dynamically influenced by the current track's album cover.

---

## ✨ Core Features

1. **🎧 Real-Time Listening Room ("Listen Together")**:
   * Private, Friends-Only, Public, and Radio modes.
   * Real-time synchronized playback: play/pause/seek broadcast with sub-second drift compensation.
   * Host-controlled or collaborative playback modes.
   * One-click invite link / code generator.

2. **❤️ Floating Reactions**:
   * Reactions (`😂`, `❤️`, `🔥`, `😭`, `✨`) float upward gracefully with physics and disappear, visible simultaneously on all listeners' devices.

3. **📊 Song Reaction Timeline**:
   * Every reaction is pinned to an audio timestamp (`0:25 ❤️`, `0:52 🔥`, `1:31 😭`).
   * Highlights the **Peak Moment** ("Most reacted moment") with 1-click jump to the song's climax.

4. **💬 Live Chat & GIFs**:
   * Real-time text messaging, typing indicator (`Sayli is typing...`), and GIF sharing.

5. **💘 Couple & Shared Music ("Music Match")**:
   * Match percentage calculator (e.g. Suraj × Sayli = 82% match).
   * Shared song count, common artists, and shared couple playlist.

6. **🎵 Full Player & Floating Mini-Player**:
   * Cinematic full player with large cover art, synchronized lyrics, monochrome controls.
   * Persistent mini-player docked above bottom navigation with smooth progress bar.

7. **👥 Built-in Multi-User Persona Switcher**:
   * Switch between **Suraj** and **Sayli** in 1 click from the header bar to test multi-person synchronization in real-time!

---

## 🚀 Quick Start

### 1. Start the Backend Server (Port 4000)
```bash
cd viberoom/backend
npm install
npm run dev
```
* REST API: `http://localhost:4000/api`
* WebSocket: `ws://localhost:4000`

### 2. Run the Real-Time Sync Integration Test
```bash
cd viberoom/backend
npm run test:sync
```
* Verifies REST endpoints, clock synchronization, multi-client room join, synchronized playback broadcast, floating reactions, and live chat.

### 3. Start the Client (Port 3000)
```bash
cd viberoom/client
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing 2-Person Synchronization
1. Open `http://localhost:3000` in your browser as **Suraj**.
2. Open another browser window (or incognito tab) at `http://localhost:3000` and switch the persona in the top-right to **Sayli**.
3. Suraj starts playing a song and clicks **Listen Together** (or joins `LATE NIGHT BOLLYWOOD`).
4. Sayli joins the same room.
5. Notice:
   * Both hear synchronized audio playback.
   * When Suraj pauses, Sayli's player pauses instantly.
   * When Sayli clicks `🔥` or `❤️`, floating reactions appear in real time on Suraj's screen!
   * Chat messages appear live with typing indicators.
