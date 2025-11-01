import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";
import runningSheet from "../assets/sprite-sheets/ninja-running.png";
import jumpingSheet from "../assets/sprite-sheets/ninja-jumping.png";

export class Ninja {
  private sprite!: PIXI.AnimatedSprite;
  private runningAnimation!: PIXI.AnimatedSprite;
  private jumpingAnimation!: PIXI.AnimatedSprite;
  private runningFrames: PIXI.Texture[] = [];
  private jumpingFrames: PIXI.Texture[] = [];
  private runningTexture!: PIXI.Texture;
  private jumpingTexture!: PIXI.Texture;
  private position: Position;
  private velocity: number = 0;
  private isJumping: boolean = false;
  private readonly gravity = 0.1;
  private readonly jumpPower = -5;
  private groundLevel: number;
  private readonly frameSize = 64;
  // Actual ninja size inside frame: 26x40 pixels, scaled 2x = 52x80 pixels
  // Using actual sprite dimensions instead of frame size for accurate collision detection
  public readonly width = 52; // 26 * 2 (actual sprite width * scale)
  public readonly height = 80; // 40 * 2 (actual sprite height * scale)

  constructor(container: PIXI.Container, groundLevel: number) {
    this.groundLevel = groundLevel + 40;
    // Position ninja so bottom of sprite is at top of grass
    // groundLevel IS the top of the grass
    // With anchor at bottom center (0.5, 1), sprite.y should be at groundLevel
    this.position = { x: 100, y: groundLevel + 40 };

    // Load sprite sheets and create animations
    this.loadAnimations(container);
  }

  private async loadAnimations(container: PIXI.Container): Promise<void> {
    // Wait for textures to load
    await PIXI.Assets.load([runningSheet, jumpingSheet]);

    // Load running sprite sheet (vertical, 6 frames, 64x64 each)
    this.runningTexture = PIXI.Texture.from(runningSheet);

    for (let i = 0; i < 6; i++) {
      const rect = new PIXI.Rectangle(
        0,
        i * this.frameSize,
        this.frameSize,
        this.frameSize
      );
      const frame = new PIXI.Texture({
        source: this.runningTexture.source,
        frame: rect,
      });
      this.runningFrames.push(frame);
    }

    this.runningAnimation = new PIXI.AnimatedSprite(this.runningFrames);
    this.runningAnimation.animationSpeed = 0.15;
    this.runningAnimation.loop = true;
    this.runningAnimation.visible = true;

    // Load jumping sprite sheet (vertical, 8 frames, 64x64 each)
    this.jumpingTexture = PIXI.Texture.from(jumpingSheet);

    for (let i = 0; i < 8; i++) {
      const rect = new PIXI.Rectangle(
        0,
        i * this.frameSize,
        this.frameSize,
        this.frameSize
      );
      const frame = new PIXI.Texture({
        source: this.jumpingTexture.source,
        frame: rect,
      });
      this.jumpingFrames.push(frame);
    }

    this.jumpingAnimation = new PIXI.AnimatedSprite(this.jumpingFrames);
    this.jumpingAnimation.animationSpeed = 0.175;
    this.jumpingAnimation.loop = false;
    this.jumpingAnimation.visible = true;

    // Start with running animation
    this.sprite = this.runningAnimation;
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
    this.sprite.anchor.x = 0.5; // Anchor at bottom center
    this.sprite.anchor.y = 1;
    this.sprite.scale.x = 2; // Scale to 2x size
    this.sprite.scale.y = 2;
    this.sprite.play();

    container.addChild(this.sprite);
  }

  jump(): void {
    if (!this.sprite || this.isJumping) return;
    this.velocity = this.jumpPower;
    this.isJumping = true;
    this.switchToJumping();
  }

  private switchToJumping(): void {
    if (!this.sprite || !this.jumpingAnimation) return;
    const container = this.sprite.parent;
    if (container) {
      container.removeChild(this.sprite);
      this.sprite.stop();
      this.sprite = this.jumpingAnimation;
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 1;
      this.sprite.scale.x = 2; // Maintain 2x scale
      this.sprite.scale.y = 2;
      this.sprite.x = this.position.x;
      this.sprite.y = this.position.y;
      this.sprite.gotoAndPlay(0);
      container.addChild(this.sprite);
    }
  }

  private switchToRunning(): void {
    if (!this.sprite || !this.runningAnimation) return;
    const container = this.sprite.parent;
    if (container) {
      container.removeChild(this.sprite);
      this.sprite.stop();
      this.sprite = this.runningAnimation;
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 1;
      this.sprite.scale.x = 2; // Maintain 2x scale
      this.sprite.scale.y = 2;
      this.sprite.x = this.position.x;
      this.sprite.y = this.position.y;
      this.sprite.play();
      container.addChild(this.sprite);
    }
  }

  update(): void {
    // Don't update if sprite isn't loaded yet
    if (!this.sprite) return;

    // Apply gravity
    this.velocity += this.gravity;
    this.position.y += this.velocity;

    // Ground collision - bottom of ninja should be at top of grass
    // groundLevel is the top of the grass
    if (this.position.y >= this.groundLevel) {
      this.position.y = this.groundLevel;
      this.velocity = 0;
      if (this.isJumping) {
        this.isJumping = false;
        this.switchToRunning();
      }
    }

    // Update sprite position
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
  }

  getBounds(): Bounds {
    // Calculate collision bounds based on actual sprite size (26x40) scaled 2x = 52x80
    // Since sprite is anchored at bottom center (0.5, 1), the bounds are:
    // - x: centered on position.x (position.x - width/2)
    // - y: bottom is at position.y, so top is position.y - height
    const collisionWidth = this.width; // 52 (26 * 2)
    const collisionHeight = this.height; // 80 (40 * 2)

    return {
      x: this.position.x - collisionWidth / 2,
      y: this.position.y - collisionHeight,
      width: collisionWidth,
      height: collisionHeight,
    };
  }

  getPosition(): Position {
    return { ...this.position };
  }

  destroy(): void {
    // Stop animations
    if (this.runningAnimation) {
      this.runningAnimation.stop();
      if (this.runningAnimation.parent) {
        this.runningAnimation.parent.removeChild(this.runningAnimation);
      }
      this.runningAnimation.destroy({ children: true });
    }
    if (this.jumpingAnimation) {
      this.jumpingAnimation.stop();
      if (this.jumpingAnimation.parent) {
        this.jumpingAnimation.parent.removeChild(this.jumpingAnimation);
      }
      this.jumpingAnimation.destroy({ children: true });
    }

    // Destroy frame textures
    this.runningFrames.forEach((frame) => {
      if (frame && !frame.destroyed) {
        frame.destroy();
      }
    });
    this.jumpingFrames.forEach((frame) => {
      if (frame && !frame.destroyed) {
        frame.destroy();
      }
    });

    // Destroy base textures
    if (this.runningTexture && !this.runningTexture.destroyed) {
      this.runningTexture.destroy();
    }
    if (this.jumpingTexture && !this.jumpingTexture.destroyed) {
      this.jumpingTexture.destroy();
    }

    // Unload assets from cache
    PIXI.Assets.unload([runningSheet, jumpingSheet]).catch(() => {
      // Ignore errors if textures are still in use elsewhere
    });

    // Clear arrays
    this.runningFrames = [];
    this.jumpingFrames = [];
    this.sprite = null as any;
    this.runningAnimation = null as any;
    this.jumpingAnimation = null as any;
  }
}
