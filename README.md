# StadiaFlow - Global Venue Analytics Platform

## 🌍 Overview
StadiaFlow is a high-performance, real-time 3D venue management and crowd analytics platform. Built to revolutionize how we visualize live global sports events, StadiaFlow renders a fully interactive 3D Earth and dynamically tracks live stadiums based on real-time data from major sporting leagues (Cricket, Soccer, Rugby, MLB, NBA, etc.). 

## 🎯 Chosen Vertical
**Sports Technology / Smart Venues & Real-Time Data Analytics**
This project focuses on the intersection of real-time sports APIs and physical venue management, providing actionable crowd density and analytics metrics for stadium operators and fans.

## 🧠 Approach and Logic
The platform architecture revolves around a seamless integration between a WebGL spatial frontend and an aggregated data pipeline:
1. **Aggregated API Pipeline:** The engine merges live feeds from multiple global sports APIs (ESPN Scorepanels, TheSportsDB). It uses strict filtration logic to discard finished games and instantly pulls through only "In-Progress" and "Scheduled" matches.
2. **Local Caching & Data Integrity:** To bypass the strict rate-limits of geocoding services like Nominatim, we implemented a custom `VENUE_DB` containing pre-verified, exact GPS coordinates and official real-world capacities for 70+ top global stadiums.
3. **Crowd Physics Engine:** A custom physics algorithm executes locally. It applies **Fruin's Level of Service (LOS)** and **M/M/c Queueing Theory** to the stadium's real-time attendance vs. its maximum capacity, generating live heatmaps and entry gate waiting times.
4. **Spatial 3D Rendering:** Uses `react-three-fiber` and `three.js` to render the Earth topography, plot accurate orbital coordinates using Cartesian math, and build sport-specific inner stadium layouts (circular pitches for cricket, rectangular fields for football). 

## ⚙️ How the Solution Works
- Upon launching, the application fetches the centralized live data feeds.
- The `GlobalMap` component plots these matches dynamically onto an interactive 3D globe using satellite Earth textures and `OrbitControls`.
- By clicking on any live pulse on the globe, the camera dives into the **"Venue Hub"** dashboard. 
- The Venue Hub ingests the stadium's precise capacity and live attendance data to automatically convert UTC match times to the user's localized time.
- The dashboard visualizes real-time metrics including live crowd density, VIP vs. General ticket loads, and entry gate flow rates using visual heatmaps in the 3D scene.

## 🤔 Assumptions Made
- **Real-Time Data Availability:** The system assumes that third-party APIs (like ESPN) will provide reasonably up-to-date attendance figures or live scoring. If real attendance isn't supplied by the API, the engine assumes a baseline simulated fill rate strictly capped at the authentic venue capacity.
- **Timezone Alignment:** By passing UTC match timestamps, we assume the user's browser runtime has correct localized `Intl` settings to auto-convert match starts to local times.
- **Constant Gate Parameters:** For the `CrowdPhysicsEngine` queueing algorithm, we assumed constant average security processing times per gate, which can theoretically scale based on the event scale.

## 🚀 Tech Stack
- **Frontend:** React, Vite, Three.js, React-Three-Fiber, Lucide-React
- **Backend/Database:** Supabase (Ready for persistent analytics logging and custom user settings)
- **Deployment:** Vercel

---
*Developed for submission.*
