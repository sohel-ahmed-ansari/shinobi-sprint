import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";

export class Enemy {
  private sprite: PIXI.Graphics;
  private position: Position;
  private readonly speed: number;
  private readonly baseY: number;
  private velocity: number = 0;
  private isJumping: boolean = false;
  private readonly gravity = 0.2;
  private readonly jumpPower = -12;
  private nextJumpTime: number = 0;
  private frameCount: number = 0;
  public readonly width = 45;
  public readonly height = 45;
  public active = true;

  constructor(container: PIXI.Container, groundLevel: number, speed: number) {
    this.speed = speed;
    this.baseY = groundLevel - 45;
    this.position = {
      x: window.innerWidth + 50,
      y: this.baseY,
    };

    // Set first jump time randomly between 90-210 frames
    this.nextJumpTime = 90 + Math.random() * 120;

    this.sprite = new PIXI.Graphics();
    this.drawEnemy();
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    container.addChild(this.sprite);
  }

  private drawEnemy(): void {
    // Body
    this.sprite
      .rect(-this.width / 2, -this.height / 2, this.width, this.height)
      .fill(0x8b0000);

    // Head
    this.sprite
      .rect(-this.width / 2, -this.height / 2 - 15, this.width, 20)
      .fill(0x5a0000);

    // Evil eyes
    this.sprite.circle(-8, -this.height / 2 - 5, 4).fill(0xffff00);
    this.sprite.circle(8, -this.height / 2 - 5, 4).fill(0xffff00);

    // Arms
    this.sprite.rect(this.width / 2, -this.height / 4, 15, 8).fill(0x6b0000);
    this.sprite
      .rect(-this.width / 2 - 15, -this.height / 4, 15, 8)
      .fill(0x6b0000);

    // Legs
    this.sprite.rect(-this.width / 4, this.height / 2, 8, 15).fill(0x5a0000);
    this.sprite.rect(this.width / 4 - 8, this.height / 2, 8, 15).fill(0x5a0000);
  }

  update(): void {
    if (!this.active) return;

    this.position.x -= this.speed;
    this.frameCount++;

    // Random jump at intervals
    if (!this.isJumping && this.frameCount >= this.nextJumpTime) {
      this.velocity = this.jumpPower;
      this.isJumping = true;
      // Set next jump time randomly between 150-270 frames
      this.nextJumpTime = this.frameCount + 150 + Math.random() * 120;
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
      }
    }

    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    // Remove if off screen
    if (this.position.x < -100) {
      this.active = false;
    }
  }

  getBounds(): Bounds {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  getPosition(): Position {
    return { ...this.position };
  }

  destroy(): void {
    if (this.sprite) {
      if (this.sprite.parent) {
        this.sprite.parent.removeChild(this.sprite);
      }
      this.sprite.destroy({ children: true });
    }
    this.active = false;
  }
}
