# VOXHAND: Vision-Based Sign Language & Speech Translation System

An assistive computer vision prototype built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **MediaPipe Hands (21-Keypoint 3D Tracking)**, and the **Web Speech Synthesis API**.

## Key Features

- **15 Mandatory Word-Level Sign Vocabulary**: Recognizes essential medical, emergency, daily need, and core dialogue signs (`EMERGENCY`, `HELP`, `DOCTOR`, `PAIN`, `MEDICINE`, `WATER`, `FOOD`, `BATHROOM`, `MORE`, `HELLO`, `THANK_YOU`, `PLEASE`, `YES`, `NO`, `STOP`).
- **Real-Time 3D Skeletal Overlay & Telemetry**: 30+ FPS MediaPipe Hands tracking with dynamic bounding box, confidence score gate (`>=80%` Verified Output vs `<80%` Low-Confidence alert), and 600ms temporal hold debounce.
- **Rotation-Invariant & Multi-Sample Calibration Studio**: Automatically aligns wrist-to-MCP hand roll, normalizes camera distance, and supports live 5x burst pose training (Cosine + Euclidean similarity blending).
- **Full Audio & Speech Control Panel**: Controllable volume (`-10%` / `+10%` step buttons, `0%–100%` slider, Mute/Unmute), speech rate (`0.75x–1.5x`), pitch, system voice selector, immediate sign vocalization, and 1.5s sentence pause auto-speak.
- **Built-in Kinematic SimBench**: Test all 15 mandatory signs and the `<80%` confidence gate deterministically even without a physical webcam attached.

## Quickstart

```bash
npm install
npm run dev
```
