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
    this.position = { x: 100, y: groundLevel };

    this.sprite = new PIXI.Graphics();
    this.drawNinja();
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    container.addChild(this.sprite);
  }

  private drawNinja(): void {
    // Ninja body
    this.sprite.beginFill(0x2c3e50);
    this.sprite.drawRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    this.sprite.endFill();

    // Ninja head
    this.sprite.beginFill(0x1a1a2e);
    this.sprite.drawCircle(0, -this.height / 2 - 10, 12);
    this.sprite.endFill();

    // Arm (holding shuriken)
    this.sprite.beginFill(0x34495e);
    this.sprite.drawRect(this.width / 2, -this.height / 4, 20, 8);
    this.sprite.endFill();

    // Leg
    this.sprite.beginFill(0x2c3e50);
    this.sprite.drawRect(-this.width / 4, this.height / 2, 8, 15);
    this.sprite.endFill();

    // Eye shine
    this.sprite.beginFill(0xff0000);
    this.sprite.drawCircle(3, -this.height / 2 - 8, 2);
    this.sprite.endFill();
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

    // Ground collision
    if (this.position.y >= this.groundLevel) {
      this.position.y = this.groundLevel;
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
}
