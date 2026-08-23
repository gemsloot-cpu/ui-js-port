# Gemsloot CPU UI & Juice Library (Phaser 3 + Vite)

A modern, standalone Phaser 3 web application ported from the Godot 4 `gemsloot-cpu-ui` and Juice Library.

## Features
- **Phaser 3 (v3.80+) & Vite (v5.0+)**: Fast ES6 module bundling and development server.
- **Juice & Polish Engine**:
  - `ShakeCamera2D`: Trauma-decay ($trauma^2$) multi-frequency harmonic screen shake.
  - `JuiceTime`: Impact freeze-frame hit-stops & smooth bullet-time slow motion.
  - `JuiceSFX` & `SFXBank`: Audio banks with pitch shifting (0.9–1.1) and volume randomization.
  - `HitFlash` & `HitFlashPipeline`: Custom WebGL PostFX hit-flash shader.
  - `CrtPostFXPipeline`: Fullscreen CRT shader with barrel curvature, scanlines, chromatic aberration, and vignette.
  - `DamageNumbers`: Dynamic arcing floating combat numbers with crits, heals, and shields.
- **Tactile UI Components**:
  - `JuiceButton`: Container button with pointerdown squish, hover lift & glow border, and sound triggers.
  - `JuiceBar`: Dual-fill progress bar with primary color fill and delayed trailing white ghost bar.
  - `JuiceCounter`: Numeric rolling text with interpolation and scale-punch feedback.
  - `ToastLayer` & `JuiceToast`: Auto-dismissing notification stack with upward shifting.
  - `JuiceMenu` & `JuiceBackdrop`: Animated modal dialog window.
  - `JuiceTooltip`: Floating tooltip with smart edge collision.

## Setup & Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```
