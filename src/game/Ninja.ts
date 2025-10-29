import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";

export class Ninja {
  private sprite: PIXI.Graphics;
  private position: Position;
  private velocity: number = 0;
  private isJumping: boolean = false;
  private readonly gravity = 0.8;
  private readonly jumpPower = -15;
  private groundLevel: number;
  public readonly width = 40;
  public readonly height = 50;

  constructor(container: PIXI.Container, groundLevel: number) {
    this.groundLevel = groundLevel;
    // Position ninja so bottom of sprite is at top of grass
    // groundLevel IS the top of the grass
    this.position = { x: 100, y: groundLevel - this.height };

    this.sprite = new PIXI.Graphics();
    this.drawNinja();
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    container.addChild(this.sprite);
  }

  private drawNinja(): void {
    // Ninja body
    this.sprite
      .rect(-this.width / 2, -this.height / 2, this.width, this.height)
      .fill(0x2c3e50);

    // Ninja head
    this.sprite.circle(0, -this.height / 2 - 10, 12).fill(0x1a1a2e);

    // Arm (holding shuriken)
    this.sprite.rect(this.width / 2, -this.height / 4, 20, 8).fill(0x34495e);

    // Leg
    this.sprite.rect(-this.width / 4, this.height / 2, 8, 15).fill(0x2c3e50);

    // Eye shine
    this.sprite.circle(3, -this.height / 2 - 8, 2).fill(0xff0000);
  }

  jump(): void {
    if (!this.isJumping) {
      this.velocity = this.jumpPower;
      this.isJumping = true;
    }
  }

  update(): void {
    // Apply gravity
    this.velocity += this.gravity;
    this.position.y += this.velocity;

    // Ground collision - bottom of ninja should be at top of grass
    // groundLevel is the top of the grass
    if (this.position.y + this.height >= this.groundLevel) {
      this.position.y = this.groundLevel - this.height;
      this.velocity = 0;
      this.isJumping = false;
    }

    // Update sprite position
    this.sprite.y = this.position.y;
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
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}
