import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";

export class Enemy {
  private sprite: PIXI.Graphics;
  private position: Position;
  private readonly speed: number;
  private readonly verticalSpeed: number;
  private time = 0;
  public readonly width = 45;
  public readonly height = 45;
  public active = true;

  constructor(container: PIXI.Container, groundLevel: number, speed: number) {
    this.speed = speed;
    this.position = {
      x: window.innerWidth + 50,
      y: groundLevel - 20 - Math.random() * 50,
    };

    this.verticalSpeed = 0.5 + Math.random() * 1;

    this.sprite = new PIXI.Graphics();
    this.drawEnemy();
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    container.addChild(this.sprite);
  }

  private drawEnemy(): void {
    // Body
    this.sprite.beginFill(0x8b0000);
    this.sprite.drawRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    this.sprite.endFill();

    // Head
    this.sprite.beginFill(0x5a0000);
    this.sprite.drawRect(
      -this.width / 2,
      -this.height / 2 - 15,
      this.width,
      20
    );
    this.sprite.endFill();

    // Evil eyes
    this.sprite.beginFill(0xffff00);
    this.sprite.drawCircle(-8, -this.height / 2 - 5, 4);
    this.sprite.drawCircle(8, -this.height / 2 - 5, 4);
    this.sprite.endFill();

    // Arms
    this.sprite.beginFill(0x6b0000);
    this.sprite.drawRect(this.width / 2, -this.height / 4, 15, 8);
    this.sprite.drawRect(-this.width / 2 - 15, -this.height / 4, 15, 8);
    this.sprite.endFill();

    // Legs
    this.sprite.beginFill(0x5a0000);
    this.sprite.drawRect(-this.width / 4, this.height / 2, 8, 15);
    this.sprite.drawRect(this.width / 4 - 8, this.height / 2, 8, 15);
    this.sprite.endFill();
  }

  update(): void {
    if (!this.active) return;

    this.position.x -= this.speed;
    this.time += 0.1;

    // Slight vertical bobbing motion
    const bobOffset = Math.sin(this.time) * 3;
    this.position.y += bobOffset * this.verticalSpeed;

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
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}
