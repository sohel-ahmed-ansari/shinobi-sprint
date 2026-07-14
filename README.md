# Shinobi Sprint

An endless side-scrolling ninja runner game built with TypeScript, PixiJS, and Vite.

## Live URL

The game is deployed on github pages at https://sohel-ahmed-ansari.github.io/shinobi-sprint/

### Story behind the game:

I started this as something to add to my website [sohelansari.com](https://sohelansari.com/). Eventually spent more time than I thought and my son wanted more and more things which I kept adding and this is what it became.

I am an experienced frontend developer but I had 0 experience in game development. So this is the first game I have ever built.

As a kid who played a lot of games on Sega, Shinobi games were one of my favourites which is why I went with this idea.

I created an initial setup with vite using typescript and tailwind css and then prompted cursor to create the game by giving very basic idea about the game. Then I kept improving it with a mix of hands on code and cursor prompts, finding assets online and generating some with AI.

I wish I knew graphic designing so I could make characters exactly the way I want. But I did my best with what I had.

## 🎮 Game Description

Control your ninja in this fast-paced endless runner! Jump over obstacles, shoot shurikens at enemies, and survive as long as possible. The game features:

- **Parallax scrolling background** with multiple layers
- **Particle effects** when shurikens hit enemies
- **Progressive difficulty** - game speed increases over time
- **Collision detection** for obstacles and enemies
- **Score system** based on survival time and defeated enemies
- **Installable PWA** - install to your phone/desktop and play offline

## 🎯 Controls

- **SPACE / W / UP Arrow** - Jump to avoid obstacles
- **Shift/Enter** to fire Shurikens
- Touch left side of screen to jump
- Touch right side of screen to throw Shurikens

## 📲 Install as an App (PWA)

Shinobi Sprint is a Progressive Web App, so you can install it to your device's home screen and play it fullscreen and offline.

- **Android / Desktop (Chrome, Edge):** Tap the **Install** button in the top-right corner, or use the browser's install icon in the address bar.
- **iOS (Safari):** Tap the **Install** button for step-by-step instructions, or use **Share → Add to Home Screen**.

Once installed, the app shell and game assets are cached by a service worker, so the game keeps working without a network connection.

## 🚀 Getting Started

### Prerequisites

- Node.js
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

> The PWA (manifest + service worker) is only generated in production builds, so use `pnpm build && pnpm preview` to test install/offline behavior.

### Regenerating the app icons

The PWA icons in `public/` are generated from the ninja sprite. To regenerate them after changing the source art:

```bash
node scripts/generate-icons.mjs
```

## 🛠️ Tech Stack

- **PixiJS 8.x** - Powerful 2D WebGL rendering engine
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **vite-plugin-pwa** - Installable PWA with offline service-worker caching
- **GitHub Pages** - Deployment
- **Cursor** - Heavily used cursor for development as I had

## 📁 Project Structure

```
src/
├── main.ts                    # Game entry point
├── pwa.ts                     # PWA install button logic
└── game/
    ├── Game.ts                # Main game controller
    ├── Ninja.ts               # Player character
    ├── Enemy.ts               # Hostile entities
    ├── Obstacle.ts            # Static hazards
    ├── Shuriken.ts            # Projectile weapons
    ├── ParticleSystem.ts      # Particle effects
    └── ParallaxBackground.ts  # Background layers

scripts/
└── generate-icons.mjs         # Generates PWA icons from the ninja sprite
```

## 🎨 Game Features

### Parallax Scrolling

Multiple background layers scroll at different speeds to create depth and immersion.

### Particle System

Beautiful particle explosions when shurikens hit enemies, complete with physics-based movement.

### Dynamic Difficulty

Game speed gradually increases to keep the challenge escalating.

### Collision Detection

Bounding box collision detection for all game entities.
