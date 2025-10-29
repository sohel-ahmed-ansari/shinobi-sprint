import * as PIXI from "pixi.js";
import type { GameState } from "./types";
import { GameStateEnum } from "./types";
import { Ninja } from "./Ninja";
import { Enemy } from "./Enemy";
import { Obstacle } from "./Obstacle";
import { Shuriken } from "./Shuriken";
import { ParticleSystem } from "./ParticleSystem";
import { ParallaxBackground } from "./ParallaxBackground";

export class Game {
  private app!: PIXI.Application;
  private gameContainer!: PIXI.Container;
  private ninja: Ninja | null = null;
  private enemies: Enemy[] = [];
  private obstacles: Obstacle[] = [];
  private shurikens: Shuriken[] = [];
  private particleSystem!: ParticleSystem;
  private parallaxBackground!: ParallaxBackground;

  private state: GameState = GameStateEnum.MENU;
  private score: number = 0;
  private gameSpeed: number = 5;
  private nextEnemySpawn: number = 0;
  private nextObstacleSpawn: number = 0;
  private lastShurikenTime: number = 0;
  private readonly shurikenCooldown: number = 300; // ms
  private groundLevel!: number;

  // UI Elements
  private scoreText!: PIXI.Text;
  private gameOverScreen!: HTMLElement;
  private startScreen!: HTMLElement;

  constructor(_container: HTMLDivElement) {
    // Create PIXI app
    this.app = new PIXI.Application();

    this.init().then(() => {
      // Get UI elements
      this.gameOverScreen = document.querySelector(".game-over-screen")!;
      this.startScreen = document.querySelector(".start-screen")!;

      // Setup event listeners
      document
        .getElementById("start-button")
        ?.addEventListener("click", () => this.startGame());
      document
        .getElementById("restart-button")
        ?.addEventListener("click", () => this.restartGame());

      // Keyboard controls
      window.addEventListener("keydown", (e) => this.handleKeyDown(e));
      window.addEventListener("keyup", (e) => this.handleKeyUp(e));
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

    this.groundLevel = window.innerHeight - 150;

    // Create containers
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);

    // Create background
    this.parallaxBackground = new ParallaxBackground(
      window.innerWidth,
      window.innerHeight,
      this.gameContainer
    );

    // Create particle system
    this.particleSystem = new ParticleSystem(this.gameContainer);

    // Create score text
    this.scoreText = new PIXI.Text("Score: 0", {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0xffffff,
      fontWeight: "bold",
    });
    this.scoreText.x = 20;
    this.scoreText.y = 20;
    this.app.stage.addChild(this.scoreText);

    // Handle window resize
    window.addEventListener("resize", () => this.handleResize());

    // Start game loop
    this.app.ticker.add(() => this.gameLoop());
  }

  private handleResize(): void {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.groundLevel = window.innerHeight - 150;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.state !== GameStateEnum.PLAYING) return;
    if (
      e.code === "ShiftRight" ||
      e.code === "ShiftLeft" ||
      e.code === "Enter"
    ) {
      e.preventDefault();
      this.fireShuriken();
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

  private fireShuriken(): void {
    if (!this.ninja || this.state !== GameStateEnum.PLAYING) return;

    const ninjaPos = this.ninja.getPosition();
    const shuriken = new Shuriken(this.gameContainer, {
      x: ninjaPos.x + 30,
      y: ninjaPos.y,
    });

    this.shurikens.push(shuriken);
  }

  private startGame(): void {
    this.state = GameStateEnum.PLAYING;
    this.score = 0;
    this.gameSpeed = 5;
    this.nextEnemySpawn = 150; // Delay before first enemy spawns
    this.nextObstacleSpawn = 200; // Delay before first obstacle spawns

    // Hide start screen
    this.startScreen.classList.remove("active");

    // Create ninja
    this.ninja = new Ninja(this.gameContainer, this.groundLevel);

    // Start auto-fire
    this.lastShurikenTime = Date.now();
  }

  private restartGame(): void {
    // Clean up current game
    this.ninja = null;

    this.enemies.forEach((e) => e.destroy());
    this.obstacles.forEach((o) => o.destroy());
    this.shurikens.forEach((s) => s.destroy());

    this.enemies = [];
    this.obstacles = [];
    this.shurikens = [];

    // Clear particles
    this.particleSystem.clear();

    // Hide game over screen
    this.gameOverScreen.classList.remove("active");

    // Restart
    this.startGame();
  }

  private gameOver(): void {
    if (this.state === GameStateEnum.GAME_OVER) return;

    this.state = GameStateEnum.GAME_OVER;

    // Show game over screen
    const scoreText = this.gameOverScreen.querySelector("p");
    if (scoreText) {
      scoreText.textContent = `Final Score: ${this.score}`;
    }
    this.gameOverScreen.classList.add("active");
  }

  private gameLoop(): void {
    if (this.state !== GameStateEnum.PLAYING) return;

    const dt = this.app.ticker.deltaTime;
    this.gameSpeed += 0.0001; // Gradually increase difficulty

    // Update parallax background
    this.parallaxBackground.update(this.gameSpeed);

    // Update ninja
    this.ninja?.update();

    // Auto-fire shurikens at regular intervals
    /* const now = Date.now();
    if (now - this.lastShurikenTime > this.shurikenCooldown) {
      this.fireShuriken();
      this.lastShurikenTime = now;
    } */

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

    // Update enemies
    this.enemies.forEach((enemy) => enemy.update());

    // Update obstacles
    this.obstacles.forEach((obstacle) => obstacle.update());

    // Update shurikens
    this.shurikens.forEach((shuriken) => shuriken.update());

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

    // Remove inactive entities
    this.enemies = this.enemies.filter((e) => e.active);
    this.obstacles = this.obstacles.filter((o) => o.active);
    this.shurikens = this.shurikens.filter((s) => s.active);

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
      this.gameSpeed
    );
    this.enemies.push(enemy);
  }

  private spawnObstacle(): void {
    const obstacle = new Obstacle(
      this.gameContainer,
      this.groundLevel,
      this.gameSpeed
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
