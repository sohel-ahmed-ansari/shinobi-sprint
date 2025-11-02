import * as PIXI from "pixi.js";
import type { GameState } from "./types";
import { GameStateEnum } from "./types";
import { Ninja } from "./Ninja";
import { Enemy } from "./Enemy";
import { Obstacle } from "./Obstacle";
import { Shuriken } from "./Shuriken";
import { ParticleSystem } from "./ParticleSystem";
import { ParallaxBackground } from "./ParallaxBackground";
import backgroundMusicUrl from "../assets/sounds/background.mp3";

export class Game {
  private app!: PIXI.Application;
  private gameContainer!: PIXI.Container;
  private ninja: Ninja | null = null;
  private enemies: Enemy[] = [];
  private obstacles: Obstacle[] = [];
  private shurikens: Shuriken[] = [];
  private particleSystem!: ParticleSystem;
  private parallaxBackground!: ParallaxBackground;
  private grassFloor!: PIXI.Graphics;

  private state: GameState = GameStateEnum.MENU;
  private score: number = 0;
  private gameSpeed: number = 5;
  private nextEnemySpawn: number = 0;
  private nextObstacleSpawn: number = 0;
  private lastShurikenTime: number = 0;
  private readonly shurikenCooldown: number = 300; // ms
  private groundLevel!: number;
  private grassHeight: number = 100;
  private mobileScale: number = 1; // Scale factor for mobile devices

  // UI Elements
  private scoreText!: PIXI.Text;
  private gameOverScreen!: HTMLElement;
  private startScreen!: HTMLElement;

  // Audio
  private backgroundMusic!: HTMLAudioElement;

  constructor(_container: HTMLDivElement) {
    // Create PIXI app
    this.app = new PIXI.Application();

    this.init().then(() => {
      // Get UI elements
      this.gameOverScreen = document.getElementById("game-over-screen")!;
      this.startScreen = document.getElementById("start-screen")!;

      // Setup event listeners
      const startButton = document.getElementById("start-button");
      const restartButton = document.getElementById("restart-button");

      if (startButton) {
        startButton.addEventListener("click", () => {
          this.startGame();
          this.playBackgroundMusic(); // Try to start music on user interaction
        });
        startButton.addEventListener("touchstart", (e) => {
          e.preventDefault();
          this.startGame();
          this.playBackgroundMusic(); // Try to start music on user interaction
        });
      }

      if (restartButton) {
        restartButton.addEventListener("click", () => {
          this.restartGame();
          this.playBackgroundMusic(); // Restart music on user interaction
        });
        restartButton.addEventListener("touchstart", (e) => {
          e.preventDefault();
          this.restartGame();
          this.playBackgroundMusic(); // Restart music on user interaction
        });
      }

      // Keyboard controls
      window.addEventListener("keydown", (e) => this.handleKeyDown(e));
      window.addEventListener("keyup", (e) => this.handleKeyUp(e));

      // Touch controls
      window.addEventListener("touchstart", (e) => this.handleTouchStart(e));
      window.addEventListener("touchend", (e) => this.handleTouchEnd(e));
    });
  }

  private async init(): Promise<void> {
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x87ceeb,
      antialias: true,
    });

    document.getElementById("app")!.appendChild(this.app.canvas);

    // Calculate mobile scale factor based on screen width
    // Use 0.7 scale for screens narrower than 768px, gradually scaling down to 0.5 for very small screens
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      // Mobile scale: 0.5 for 320px width, 0.7 for 768px width
      this.mobileScale = 0.5 + ((screenWidth - 320) / (768 - 320)) * 0.2;
      this.mobileScale = Math.max(0.5, Math.min(0.7, this.mobileScale)); // Clamp between 0.5 and 0.7
      // Also scale grass height for mobile
      this.grassHeight = 100 * this.mobileScale;
    } else {
      this.mobileScale = 1;
      this.grassHeight = 100;
    }

    this.groundLevel = window.innerHeight - this.grassHeight;

    // Create containers
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);

    // Create background
    this.parallaxBackground = new ParallaxBackground(
      window.innerWidth,
      window.innerHeight,
      this.gameContainer,
      this.grassHeight
    );

    // Create grass floor
    this.createGrassFloor();

    // Create particle system
    this.particleSystem = new ParticleSystem(this.gameContainer);

    // Create score text
    const scoreFontSize = 24 * this.mobileScale;
    this.scoreText = new PIXI.Text({
      text: "Score: 0",
      style: {
        fontFamily: "Arial",
        fontSize: scoreFontSize,
        fill: 0xffffff,
        fontWeight: "bold",
      },
    });
    this.scoreText.x = 20 * this.mobileScale;
    this.scoreText.y = 20 * this.mobileScale;
    this.app.stage.addChild(this.scoreText);

    // Handle window resize
    window.addEventListener("resize", () => this.handleResize());

    // Initialize background music
    this.initBackgroundMusic();

    // Start game loop
    this.app.ticker.add(() => this.gameLoop());
  }

  private initBackgroundMusic(): void {
    this.backgroundMusic = new Audio(backgroundMusicUrl);
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5; // Set volume to 50%
    // Note: Audio will start playing when user interacts (required by browsers)
  }

  private handleResize(): void {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);

    // Recalculate mobile scale on resize
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      this.mobileScale = 0.5 + ((screenWidth - 320) / (768 - 320)) * 0.2;
      this.mobileScale = Math.max(0.5, Math.min(0.7, this.mobileScale));
      this.grassHeight = 100 * this.mobileScale;
    } else {
      this.mobileScale = 1;
      this.grassHeight = 100;
    }

    this.groundLevel = window.innerHeight - this.grassHeight;

    // Recreate grass floor on resize
    if (this.grassFloor) {
      this.gameContainer.removeChild(this.grassFloor);
      this.grassFloor.destroy();
    }
    this.createGrassFloor();
  }

  private createGrassFloor(): void {
    const segmentWidth = window.innerWidth;
    const numSegments = 3; // Number of repeating grass segments

    this.grassFloor = new PIXI.Graphics();

    // Simple flat grass color
    const grassColor = 0x4a7c59;

    // Create simple repeating grass segments for seamless scrolling
    for (let seg = 0; seg < numSegments; seg++) {
      const startX = seg * segmentWidth;

      // Draw simple flat grass rectangle
      this.grassFloor
        .rect(startX, this.groundLevel, segmentWidth, this.grassHeight)
        .fill(grassColor);
    }

    // Set initial position
    this.grassFloor.y = 0;

    // Add to container (after background but before game objects)
    // Move it to appear after parallax background layers (5 layers)
    this.gameContainer.addChild(this.grassFloor);
    this.gameContainer.setChildIndex(this.grassFloor, 5);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.state !== GameStateEnum.PLAYING) return;
    if (
      e.code === "ShiftRight" ||
      e.code === "ShiftLeft" ||
      e.code === "Enter"
    ) {
      e.preventDefault();
      this.checkCooldownAndFireShuriken();
    } else if (
      e.code === "Space" ||
      e.code === "KeyW" ||
      e.code === "ArrowUp"
    ) {
      e.preventDefault();
      this.ninja?.jump();
    }
  }

  private handleKeyUp(_e: KeyboardEvent): void {
    // No longer used - auto-fire is handled in game loop
  }

  private handleTouchStart(e: TouchEvent): void {
    if (this.state !== GameStateEnum.PLAYING) return;
    e.preventDefault();

    // Process all touch points to support multi-touch
    const screenWidth = window.innerWidth;
    let hasLeftTouch = false;
    let hasRightTouch = false;

    // Check all touches to see if we have touches on both sides
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const touchX = touch.clientX;

      if (touchX < screenWidth / 2) {
        hasLeftTouch = true;
      } else {
        hasRightTouch = true;
      }
    }

    // Execute actions based on which sides are touched
    if (hasLeftTouch) {
      // Left side - jump
      this.ninja?.jump();
    }

    if (hasRightTouch) {
      // Right side - throw shuriken
      this.checkCooldownAndFireShuriken();
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    // Prevent default to avoid mouse events from being triggered
    e.preventDefault();
  }

  private fireShuriken(): void {
    if (!this.ninja || this.state !== GameStateEnum.PLAYING) return;

    const ninjaPos = this.ninja.getPosition();
    const shuriken = new Shuriken(
      this.gameContainer,
      {
        x: ninjaPos.x + 30 * this.mobileScale,
        y: ninjaPos.y - 60 * this.mobileScale,
      },
      this.mobileScale
    );

    this.shurikens.push(shuriken);
  }

  private startGame(): void {
    this.state = GameStateEnum.PLAYING;
    this.score = 0;
    this.gameSpeed = 5;
    this.nextEnemySpawn = 150; // Delay before first enemy spawns
    this.nextObstacleSpawn = 200; // Delay before first obstacle spawns

    // Hide start screen
    this.startScreen.classList.add("hidden");
    this.startScreen.classList.remove("flex");

    // Create ninja with mobile scale
    this.ninja = new Ninja(
      this.gameContainer,
      this.groundLevel,
      this.mobileScale
    );

    // Start auto-fire
    this.lastShurikenTime = Date.now();

    // Start background music (if not already playing)
    this.playBackgroundMusic();
  }

  private playBackgroundMusic(): void {
    if (this.backgroundMusic) {
      // Always reset to beginning when starting/restarting
      this.backgroundMusic.currentTime = 0;
      // Try to play, catch errors (some browsers require user interaction first)
      this.backgroundMusic.play().catch(() => {
        // Audio play was prevented, likely due to browser autoplay policy
        // Music will start when user interacts with the game
        console.log("Background music will start after user interaction");
      });
    }
  }

  private stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0; // Reset to beginning
    }
  }

  private restartGame(): void {
    // Clean up current game - destroy all game objects
    this.ninja?.destroy();
    this.ninja = null;

    // Destroy all enemies, obstacles, and shurikens
    this.enemies.forEach((e) => e.destroy());
    this.obstacles.forEach((o) => o.destroy());
    this.shurikens.forEach((s) => s.destroy());

    // Clean up shared obstacle textures
    Obstacle.cleanupTextures();

    // Clear arrays
    this.enemies = [];
    this.obstacles = [];
    this.shurikens = [];

    // Clear particles
    this.particleSystem.clear();

    // Force garbage collection hint (browser may or may not honor this)
    // This helps ensure textures are actually freed from memory

    // Hide game over screen
    this.gameOverScreen.classList.add("hidden");
    this.gameOverScreen.classList.remove("flex");

    // Restart
    this.startGame();
  }

  private gameOver(): void {
    if (this.state === GameStateEnum.GAME_OVER) return;

    this.state = GameStateEnum.GAME_OVER;

    // Stop background music when game ends
    this.stopBackgroundMusic();

    // Show game over screen
    const scoreText = this.gameOverScreen.querySelector("p");
    if (scoreText) {
      scoreText.textContent = `Final Score: ${Math.floor(this.score)}`;
    }
    this.gameOverScreen.classList.remove("hidden");
    this.gameOverScreen.classList.add("flex");
  }

  private checkCooldownAndFireShuriken(): void {
    const now = Date.now();
    if (now - this.lastShurikenTime > this.shurikenCooldown) {
      this.fireShuriken();
      this.lastShurikenTime = now;
    }
  }

  private gameLoop(): void {
    if (this.state !== GameStateEnum.PLAYING) return;

    const dt = this.app.ticker.deltaTime;
    this.gameSpeed += 0.0001; // Gradually increase difficulty

    // Update parallax background
    this.parallaxBackground.update(this.gameSpeed);

    // Update grass floor scrolling
    if (this.grassFloor) {
      this.grassFloor.x -= this.gameSpeed;

      // Reset position when it scrolls off screen for seamless loop
      const segmentWidth = window.innerWidth;
      if (this.grassFloor.x <= -segmentWidth) {
        this.grassFloor.x += segmentWidth;
      }
    }

    // Update ninja
    this.ninja?.update();

    // Auto-fire shurikens at regular intervals
    // this.checkCooldownAndFireShuriken();

    // Spawn enemies
    this.nextEnemySpawn -= dt;
    if (this.nextEnemySpawn <= 0) {
      this.spawnEnemy();
      this.nextEnemySpawn = 90 + Math.random() * 60;
    }

    // Spawn obstacles
    this.nextObstacleSpawn -= dt;
    if (this.nextObstacleSpawn <= 0) {
      this.spawnObstacle();
      this.nextObstacleSpawn = 120 + Math.random() * 80;
    }

    // Update enemies and remove off-screen ones immediately
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update();
      if (!enemy.active) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // Update obstacles and remove off-screen ones immediately
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update();
      if (!obstacle.active) {
        obstacle.destroy();
        this.obstacles.splice(i, 1);
      }
    }

    // Update shurikens and remove off-screen ones immediately
    for (let i = this.shurikens.length - 1; i >= 0; i--) {
      const shuriken = this.shurikens[i];
      shuriken.update();
      if (!shuriken.active) {
        shuriken.destroy();
        this.shurikens.splice(i, 1);
      }
    }

    // Check collisions: Shuriken vs Enemy
    for (let i = this.shurikens.length - 1; i >= 0; i--) {
      const shuriken = this.shurikens[i];
      if (!shuriken.active) continue;

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy.active) continue;

        if (this.checkCollision(shuriken.getBounds(), enemy.getBounds())) {
          // Hit enemy
          const pos = enemy.getPosition();
          this.particleSystem.createExplosion(pos.x, pos.y, 0xff8800);

          shuriken.destroy();
          enemy.destroy();
          this.shurikens.splice(i, 1);
          this.enemies.splice(j, 1);

          this.score += 10;
          break;
        }
      }
    }

    // Check collisions: Ninja vs Enemy/Obstacle
    if (this.ninja) {
      const ninjaBounds = this.ninja.getBounds();

      // Check enemy collisions
      for (const enemy of this.enemies) {
        if (
          enemy.active &&
          this.checkCollision(ninjaBounds, enemy.getBounds())
        ) {
          this.gameOver();
          return;
        }
      }

      // Check obstacle collisions
      for (const obstacle of this.obstacles) {
        if (
          obstacle.active &&
          this.checkCollision(ninjaBounds, obstacle.getBounds())
        ) {
          this.gameOver();
          return;
        }
      }
    }

    // Update particles
    this.particleSystem.update();

    // Update score (survival bonus)
    this.score += 0.1;
    this.scoreText.text = `Score: ${Math.floor(this.score)}`;
  }

  private spawnEnemy(): void {
    const enemy = new Enemy(
      this.gameContainer,
      this.groundLevel,
      this.gameSpeed,
      this.mobileScale
    );
    this.enemies.push(enemy);
  }

  private spawnObstacle(): void {
    const obstacle = new Obstacle(
      this.gameContainer,
      this.groundLevel,
      this.gameSpeed,
      this.mobileScale
    );
    this.obstacles.push(obstacle);
  }

  private checkCollision(a: any, b: any): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
