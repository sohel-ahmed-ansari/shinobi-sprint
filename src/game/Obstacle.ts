import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";
import bamboosImage from "../assets/obstacles/bamboos.png";
import stoneImage from "../assets/obstacles/stone.png";

// Obstacle data structure
interface ObstacleData {
  asset: string;
  width: number;
  height: number;
}

// Array of available obstacles with their dimensions - easily extendable
// To add new obstacles: import the image and add an entry with width and height
const OBSTACLE_DATA: ObstacleData[] = [
  { asset: bamboosImage, width: 69, height: 27 },
  { asset: stoneImage, width: 56, height: 40 },
];

const TARGET_HEIGHT = 60; // All obstacles will be scaled to this height

export class Obstacle {
  private sprite: PIXI.Sprite;
  private position: Position;
  private readonly speed: number;
  public width: number; // Scaled width
  public readonly height = TARGET_HEIGHT; // Always 60
  public active = true;
  private static obstacleTextures: PIXI.Texture[] = [];
  private static loaded = false;
  private selectedObstacleData: ObstacleData | null = null;

  constructor(container: PIXI.Container, groundLevel: number, speed: number) {
    this.speed = speed;
    // Width will be set after loading obstacle (scaled based on aspect ratio)
    this.width = 0;

    // Position obstacle so bottom is at ground level
    // With anchor.y = 1, sprite.y directly represents the bottom edge
    this.position = {
      x: window.innerWidth + 50,
      y: groundLevel + 20,
    };

    // Initialize sprite (will be set in loadObstacle)
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.x = 0;
    this.sprite.anchor.y = 1; // Anchor at bottom so it sits on ground
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    container.addChild(this.sprite);

    // Load obstacle texture asynchronously
    this.loadObstacle();
  }

  private async loadObstacle(): Promise<void> {
    // Load obstacle textures if not already loaded
    if (!Obstacle.loaded) {
      const assetPaths = OBSTACLE_DATA.map((data) => data.asset);
      await PIXI.Assets.load(assetPaths);
      Obstacle.obstacleTextures = OBSTACLE_DATA.map((data) =>
        PIXI.Texture.from(data.asset)
      );
      Obstacle.loaded = true;
    }

    // Randomly select an obstacle from the array
    const randomIndex = Math.floor(Math.random() * OBSTACLE_DATA.length);
    this.selectedObstacleData = OBSTACLE_DATA[randomIndex];
    const selectedTexture = Obstacle.obstacleTextures[randomIndex];

    // Calculate scale to make height = TARGET_HEIGHT while maintaining aspect ratio
    const scale = TARGET_HEIGHT / this.selectedObstacleData.height;
    const scaledWidth = this.selectedObstacleData.width * scale;

    // Set sprite properties
    this.sprite.texture = selectedTexture;
    this.sprite.scale.x = scale;
    this.sprite.scale.y = scale;
    this.width = scaledWidth;
    // Ensure position is maintained after scaling (anchor point should keep it aligned)
    //this.sprite.y = this.position.y;
    this.sprite.visible = true;
  }

  update(): void {
    if (!this.active) return;

    this.position.x -= this.speed;
    this.sprite.x = this.position.x;

    // Remove if off screen
    if (this.position.x < -100) {
      this.active = false;
    }
  }

  getBounds(): Bounds {
    // With anchor at (0, 1), the sprite's bottom-left is at position
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  getPosition(): Position {
    return { ...this.position };
  }

  destroy(): void {
    if (this.sprite) {
      // Destroy texture if this is the last reference (shared textures handled separately)
      if (this.sprite.texture && !this.sprite.texture.destroyed) {
        // For shared textures, we rely on the static cleanup method
        // Individual obstacle textures are destroyed automatically when sprite is destroyed
      }

      if (this.sprite.parent) {
        this.sprite.parent.removeChild(this.sprite);
      }
      this.sprite.destroy({ children: true });
    }
  }

  // Static method to clean up shared obstacle textures (call on game restart)
  static cleanupTextures(): void {
    if (Obstacle.loaded && Obstacle.obstacleTextures.length > 0) {
      // Destroy textures
      Obstacle.obstacleTextures.forEach((texture) => {
        if (texture && !texture.destroyed) {
          texture.destroy();
        }
      });

      // Unload assets from cache
      const assetPaths = OBSTACLE_DATA.map((data) => data.asset);
      PIXI.Assets.unload(assetPaths).catch(() => {
        // Ignore errors if textures are still in use
      });

      // Reset state
      Obstacle.obstacleTextures = [];
      Obstacle.loaded = false;
    }
  }
}
