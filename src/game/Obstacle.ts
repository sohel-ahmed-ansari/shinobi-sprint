import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";

export class Obstacle {
  private sprite: PIXI.Graphics;
  private position: Position;
  private readonly speed: number;
  public readonly width = 30;
  public readonly height = 40;
  public active = true;

  constructor(container: PIXI.Container, groundLevel: number, speed: number) {
    this.speed = speed;
    this.position = {
      x: window.innerWidth + 50,
      y: groundLevel,
    };

    this.sprite = new PIXI.Graphics();
    this.drawObstacle();
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    container.addChild(this.sprite);
  }

  private drawObstacle(): void {
    // Spike/stake
    this.sprite
      .rect(-this.width / 2, -this.height / 2, this.width, this.height)
      .fill(0x666666);

    // Pointy tip
    this.sprite
      .poly([
        -this.width / 2,
        -this.height / 2,
        this.width / 2,
        -this.height / 2,
        0,
        -this.height / 2 - 15,
      ])
      .fill(0x555555);

    // Darker shade
    this.sprite
      .rect(-this.width / 2, this.height / 2 - 10, this.width, 10)
      .fill(0x444444);
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
