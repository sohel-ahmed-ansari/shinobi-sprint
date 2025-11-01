import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";
import standingImage from "../assets/enemy/enemy-standing.png";
import jumpingImage from "../assets/enemy/enemy-jumping.png";

export class Enemy {
  private static readonly ENEMY_SCALE = 0.2; // Scale factor to adjust enemy size (0.5 = 50% of original)

  private sprite: PIXI.Sprite;
  private standingSprite!: PIXI.Sprite;
  private jumpingSprite!: PIXI.Sprite;
  private standingTexture!: PIXI.Texture;
  private jumpingTexture!: PIXI.Texture;
  private position: Position;
  private readonly speed: number;
  private baseY: number = 0; // Will be set after textures load
  private velocity: number = 0;
  private isJumping: boolean = false;
  private readonly gravity = 0.2;
  private readonly jumpPower = -12;
  private nextJumpTime: number = 0;
  private frameCount: number = 0;
  public width: number = 0; // Will be set after texture loads
  public height: number = 0; // Will be set after texture loads
  public active = true;

  constructor(container: PIXI.Container, groundLevel: number, speed: number) {
    this.speed = speed;
    this.position = {
      x: window.innerWidth + 50,
      y: 0, // Will be set after textures load
    };

    // Set first jump time randomly between 90-210 frames
    this.nextJumpTime = 90 + Math.random() * 120;

    // Create placeholder sprite that will be replaced
    const placeholderSprite = new PIXI.Sprite();
    this.sprite = placeholderSprite;
    container.addChild(placeholderSprite);

    // Load textures and create sprites
    this.loadSprites(container, placeholderSprite).then(() => {
      // Set baseY - enemy should sit on ground level (groundLevel is top of grass)
      // With anchor at bottom (1), sprite.y should be at groundLevel
      this.baseY = groundLevel + 10;
      this.position.y = this.baseY;
      this.sprite.y = this.position.y;
    });
  }

  private async loadSprites(
    container: PIXI.Container,
    placeholderSprite: PIXI.Sprite
  ): Promise<void> {
    // Load textures
    await PIXI.Assets.load([standingImage, jumpingImage]);

    this.standingTexture = PIXI.Texture.from(standingImage);
    this.jumpingTexture = PIXI.Texture.from(jumpingImage);

    // Create standing sprite
    this.standingSprite = new PIXI.Sprite(this.standingTexture);
    this.standingSprite.anchor.x = 0.5;
    this.standingSprite.anchor.y = 1; // Anchor at bottom center
    this.standingSprite.scale.set(Enemy.ENEMY_SCALE);

    // Create jumping sprite
    this.jumpingSprite = new PIXI.Sprite(this.jumpingTexture);
    this.jumpingSprite.anchor.x = 0.5;
    this.jumpingSprite.anchor.y = 1; // Anchor at bottom center
    this.jumpingSprite.scale.set(Enemy.ENEMY_SCALE);

    // Set dimensions based on scaled texture size
    this.width = this.standingTexture.width * Enemy.ENEMY_SCALE;
    this.height = this.standingTexture.height * Enemy.ENEMY_SCALE;

    // Remove placeholder sprite
    if (placeholderSprite.parent) {
      placeholderSprite.parent.removeChild(placeholderSprite);
      placeholderSprite.destroy();
    }

    // Use standing sprite by default
    this.sprite = this.standingSprite;
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
    container.addChild(this.sprite);
  }

  update(): void {
    if (!this.active || !this.sprite) return;

    this.position.x -= this.speed;
    this.frameCount++;

    // Random jump at intervals
    if (!this.isJumping && this.frameCount >= this.nextJumpTime) {
      this.velocity = this.jumpPower;
      this.isJumping = true;
      // Set next jump time randomly between 150-270 frames
      this.nextJumpTime = this.frameCount + 150 + Math.random() * 120;
      this.switchToJumping();
    }

    // Apply gravity
    if (this.isJumping) {
      this.velocity += this.gravity;
      this.position.y += this.velocity;

      // Ground collision - land at baseY position
      if (this.position.y >= this.baseY) {
        this.position.y = this.baseY;
        this.velocity = 0;
        this.isJumping = false;
        this.switchToStanding();
      }
    }

    // Update sprite position
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    // Remove if off screen
    if (this.position.x < -100) {
      this.active = false;
    }
  }

  private switchToJumping(): void {
    if (!this.jumpingSprite || this.sprite === this.jumpingSprite) return;

    const container = this.sprite.parent;
    if (container) {
      container.removeChild(this.sprite);
      this.sprite = this.jumpingSprite;
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 1;
      this.sprite.scale.set(Enemy.ENEMY_SCALE); // Maintain scale
      this.sprite.x = this.position.x;
      this.sprite.y = this.position.y;
      container.addChild(this.sprite);
    }
  }

  private switchToStanding(): void {
    if (!this.standingSprite || this.sprite === this.standingSprite) return;

    const container = this.sprite.parent;
    if (container) {
      container.removeChild(this.sprite);
      this.sprite = this.standingSprite;
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 1;
      this.sprite.scale.set(Enemy.ENEMY_SCALE); // Maintain scale
      this.sprite.x = this.position.x;
      this.sprite.y = this.position.y;
      container.addChild(this.sprite);
    }
  }

  getBounds(): Bounds {
    // Sprite is anchored at bottom center (0.5, 1)
    // So bounds: x is centered, y is from (position.y - height) to position.y
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height,
      width: this.width,
      height: this.height,
    };
  }

  getPosition(): Position {
    return { ...this.position };
  }

  destroy(): void {
    // Remove from container
    if (this.standingSprite && this.standingSprite.parent) {
      this.standingSprite.parent.removeChild(this.standingSprite);
    }
    if (this.jumpingSprite && this.jumpingSprite.parent) {
      this.jumpingSprite.parent.removeChild(this.jumpingSprite);
    }

    // Destroy sprites
    if (this.standingSprite) {
      this.standingSprite.destroy({ children: true });
    }
    if (this.jumpingSprite) {
      this.jumpingSprite.destroy({ children: true });
    }

    // Destroy textures
    if (this.standingTexture && !this.standingTexture.destroyed) {
      this.standingTexture.destroy();
    }
    if (this.jumpingTexture && !this.jumpingTexture.destroyed) {
      this.jumpingTexture.destroy();
    }

    // Unload assets from cache
    PIXI.Assets.unload([standingImage, jumpingImage]).catch(() => {
      // Ignore errors if textures are still in use elsewhere
    });

    this.active = false;
  }
}
