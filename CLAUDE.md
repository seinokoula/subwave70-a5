# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Start production server
```

No test suite is configured.

## Architecture

This is a **Next.js 15 app router** project with a single page (`app/page.js`) that renders a synthwave-themed endless runner game using **Three.js** (not `@react-three/fiber` — raw Three.js, browser-only).

### Data flow

`page.js` ("use client") coordinates three hooks:
- `useResourceLoader` — preloads OBJ/FBX models from `public/assets/` before the game starts
- `useThree(containerRef, resources, isReady)` — initializes the Three.js scene after resources are loaded and owns the `rAF` loop
- `useKeyboardControls` — fires `CustomEvent('game-control')` on the window; `page.js` listens to it and calls `moveCarLeft`/`moveCarRight`

### Three.js layer (`components/three/`)

All Three.js code lives here as plain ES classes, never React components:

| Directory | Purpose |
|-----------|---------|
| `core/` | `Scene`, `Camera`, `Renderer`, `Lights` — thin wrappers over Three.js primitives |
| `objects/` | `Road`, `Car`, `ObstacleManager`, `Streetlight`, `PalmTrees`, `SynthwaveMountains`, `SynthwaveSun` — each has an `update()` method called every frame |
| `effects/` | `PostProcessing` (Three.js `EffectComposer` from `three/examples/jsm`: bloom, scanline shader, FXAA), `CustomShaders` (updates a `time` uniform each frame) |
| `controllers/` | `GameController` — collision detection (lane-based, not bounding-box), score accumulation (`deltaTime * 10`), difficulty scaling (spawn intervals shrink from 3000–5000ms toward an 800ms floor as score approaches 1000), reset logic. It owns obstacle spawning: `startGame`/`endGame`/`reset` call `ObstacleManager.startSpawning()`/`stopSpawning()` |

Each frame, `useThree`'s `animate` loop calls every object's `update()`, then `GameController.update(deltaTime)`, then renders through `PostProcessingManager.render()` (the raw renderer is only a fallback).

Long-lived classes that own timers, listeners, or DOM nodes (`GameController`, `ObstacleManager`, `Car`, `Streetlight`, `PostProcessingManager`, `RendererManager`, `CameraManager`) expose a `dispose()` method; `useThree`'s cleanup calls all of them. If you add a timer or listener to one of these classes, release it in `dispose()`.

### Collision model

Collisions are lane-based: `car.currentLane === obstacle.lane` plus a Z-axis overlap check with hardcoded half-sizes per obstacle type (`rock: 1.1`, `police_officer: 1.2`, `barrier: 0.4`). There is no 3D bounding-box physics.

### UI layer (`components/ui/`)

React components rendered on top of the canvas: `LoadingScreen`, `GameUI` (score, game-over overlay, mobile touch buttons), `InsuranceInfo` (branded footer — this game is a marketing piece for "SubWave 70" car insurance).

### Input quirk

Left/right controls are intentionally inverted at the `page.js` level: `onMoveLeft={moveCarRight}` and `onMoveRight={moveCarLeft}`. This is intentional — do not "fix" it without understanding the coordinate system.

## Key constraints

- All Three.js code must run client-side only. Avoid any import of Three.js at module scope in Server Components.
- `useThree` guards against double-initialization with `initialized.current` — the cleanup function resets it to `false`.
- Only four models are preloaded (`car`, `police_officer`, `rock`, `palm_tree`); adding a new model requires updating the `modelPaths` array in `useResourceLoader.js`. Other files in `public/assets/` (`cone.obj`, `sunset.obj`, `soucoupe.obj`) are currently unused.
