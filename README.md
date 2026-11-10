# Aditya Mudgal — Beyond the Known

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![WebGL](https://img.shields.io/badge/WebGL-GLSL%20Shaders-990000?style=flat-square&logo=opengl)](https://www.khronos.org/webgl/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

> A high-performance, cinematic developer portfolio exploring the intersection of Artificial Intelligence, Cybersecurity, and Mobility. Featuring custom WebGL gravitational lensing shaders, procedural Web Audio soundtrack synthesis, and dynamic video environment transitions.

---

## Highlights

- **Cinematic WebGL Black Hole Shader**: Custom GLSL raymarching shader simulating gravitational light bending, accretion disk rotation, relativistic doppler beaming, and event horizon plunge dynamics.
- **Procedural Web Audio Engine**: Zero-file audio experience synthesized directly in the browser via Web Audio API oscillators, bandpass filters, and harmonic chimes responding to scroll depth and user gestures.
- **Dynamic Multi-Scene Environment**: Crossfading 4K/ambient video layers paired with section progress telemetry.
- **Fluid Micro-Interactions**: Magnetic cursor tracking, word-by-word reveal masks, count-up telemetry metrics, and a live Jaipur (IST) HUD clock.
- **Ultra Lightweight & Fast**: Sub-600ms production build powered by Vite 8 and Tailwind CSS v4.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component architecture & declarative state management |
| **TypeScript** | Type-safe development with strict compiler configuration |
| **Tailwind CSS v4** | Modern theme tokenization and utility styling |
| **WebGL & GLSL** | Hardware-accelerated procedural raymarching shader |
| **Web Audio API** | Real-time procedural soundscape synthesis |
| **Lucide Icons** | Clean, minimalist vector iconography |
| **Vite** | Lightning-fast development server & optimized bundler |

---

## Project Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Pages CI/CD workflow
├── public/
│   └── favicon.svg               # Geometric AM monogram favicon
├── src/
│   ├── assets/
│   │   └── video/                # High-fidelity video loops and fallback posters
│   ├── components/
│   │   ├── canvas/
│   │   │   └── BlackHoleCanvas.tsx # WebGL raymarching canvas & shader pipeline
│   │   ├── intro/
│   │   │   └── IntroExperience.tsx # Cinematic onboarding & horizon plunge sequence
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        # Top HUD navigation & live IST Jaipur clock
│   │   │   └── Footer.tsx        # Telemetry & copyright metadata
│   │   ├── sections/
│   │   │   ├── Hero.tsx          # Orbital scene hero with call to action
│   │   │   ├── Signal.tsx        # Manifesto & frequency wave animation
│   │   │   ├── Missions.tsx      # Traxy, Darkra, Aegis venture cards
│   │   │   ├── Profile.tsx       # Achievements, milestones & core capabilities
│   │   │   ├── Vision.tsx        # Philosophical vision & innovation outlook
│   │   │   └── Contact.tsx       # Direct communication channels
│   │   ├── ui/
│   │   │   ├── Button.tsx        # High-accessibility button with micro-states
│   │   │   ├── Magnetic.tsx      # Physics-based mouse pull wrapper
│   │   │   ├── Metric.tsx        # Animated telemetry counter
│   │   │   └── Reveal.tsx        # Intersection observer word & block reveals
│   │   └── video/
│   │       └── VideoStage.tsx    # Multi-scene crossfading video background
│   ├── context/
│   │   └── ThemeContext.tsx      # Dark / light mode state manager
│   ├── data/
│   │   └── portfolioData.ts      # Structured mission, milestone & metric content
│   ├── hooks/
│   │   ├── useInView.ts          # Viewport intersection detection hook
│   │   └── useReducedMotion.ts   # Accessibility prefers-reduced-motion hook
│   ├── lib/
│   │   ├── sound.ts              # Procedural audio engine (Web Audio API)
│   │   └── utils.ts              # Class merger (clsx + tailwind-merge) & math helpers
│   ├── types/
│   │   └── portfolio.ts          # Central TypeScript interfaces
│   ├── App.tsx                   # Main layout coordinator & scroll orchestrator
│   ├── main.tsx                  # React application entry point
│   ├── styles.css                # Fluid typography, tokens, and animations
│   └── vite-env.d.ts             # Vite client & asset module types
├── netlify.toml                  # Netlify deployment configuration
├── vercel.json                   # Vercel deployment configuration
├── vite.config.ts                # Vite 8 & Tailwind v4 build configuration
└── package.json                  # Clean dependencies & build scripts
```

---

## Getting Started

### Prerequisites

- Node.js `v20.0.0` or higher
- npm / pnpm / yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rudraxdecosta/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## Deployment Options

This portfolio is configured for zero-configuration, production-ready deployment on any modern hosting provider:

### Option 1: Vercel (Recommended)
1. Push your code to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel automatically detects Vite.
4. Click **Deploy**. (Pre-configured via `vercel.json`).

### Option 2: Netlify
1. Log in to [netlify.com](https://netlify.com) and select **"Add new site" > "Import an existing project"**.
2. Select your GitHub repository.
3. Build command: `npm run build` | Publish directory: `dist`.
4. Click **Deploy Site**. (Pre-configured via `netlify.toml`).

### Option 3: GitHub Pages
1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **"GitHub Actions"**.
4. The included `.github/workflows/deploy.yml` will automatically build and deploy the portfolio on every push to `main`.

### Option 4: Cloudflare Pages
1. In the Cloudflare dashboard, go to **Workers & Pages > Create application > Pages**.
2. Connect your GitHub repository.
3. Set Build command: `npm run build` and Output directory: `dist`.
4. Click **Save and Deploy**.

---

## Author

**Aditya Mudgal**  
AI & ML Student &middot; Cybersecurity Enthusiast &middot; Innovator  
Jaipur, Rajasthan, India  

- **GitHub**: [@rudraxdecosta](https://github.com/rudraxdecosta)
- **LinkedIn**: [Aditya Mudgal](https://www.linkedin.com/in/aditya-mudgal-568630437/)
- **Instagram**: [@ky_yr_adi_](https://www.instagram.com/ky_yr_adi_/)
- **Email**: [rudraxdecosta@gmail.com](mailto:rudraxdecosta@gmail.com)

---

## License

This project is open-source under the [MIT License](LICENSE).
