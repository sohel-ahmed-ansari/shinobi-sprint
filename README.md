# 🗡️ Shinobi Runner

An endless side-scrolling ninja runner game built with TypeScript, PixiJS, and Vite.

## 🎮 Game Description

Control your ninja in this fast-paced endless runner! Jump over obstacles, shoot shurikens at enemies, and survive as long as possible. The game features:

- **Parallax scrolling background** with multiple layers
- **Particle effects** when shurikens hit enemies
- **Progressive difficulty** - game speed increases over time
- **Auto-shooting shurikens** at enemies
- **Collision detection** for obstacles and enemies
- **Score system** based on survival time and defeated enemies

## 🎯 Controls

- **SPACE / W / UP Arrow** - Jump to avoid obstacles
- Shurikens automatically fire at enemies

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (or npm)

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

## 🛠️ Tech Stack

- **PixiJS 8.x** - Powerful 2D WebGL rendering engine
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Vanilla CSS** - Styled UI elements

## 📁 Project Structure

```
src/
├── main.ts                    # Game entry point
├── style.css                  # Game styling
└── game/
    ├── Game.ts                # Main game controller
    ├── Ninja.ts               # Player character
    ├── Enemy.ts               # Hostile entities
    ├── Obstacle.ts            # Static hazards
    ├── Shuriken.ts            # Projectile weapons
    ├── ParticleSystem.ts      # Particle effects
    ├── ParallaxBackground.ts  # Background layers
    └── types.ts               # TypeScript types
```

## 🎨 Game Features

### Parallax Scrolling

Multiple background layers scroll at different speeds to create depth and immersion.

### Particle System

Beautiful particle explosions when shurikens hit enemies, complete with physics-based movement.

### Dynamic Difficulty

Game speed gradually increases to keep the challenge escalating.

### Collision Detection

Precise bounding box collision detection for all game entities.

## 📝 License

MIT

## 🙏 Credits

Built with modern web technologies for optimal performance and development experience.
