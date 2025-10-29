import * as PIXI from "pixi.js";
import type { Position, Bounds } from "./types";

export class Shuriken {
  private sprite: PIXI.Graphics;
  private position: Position;
  private readonly speed = 8;
  public readonly width = 20;
  public readonly height = 20;
  public active = true;

  constructor(container: PIXI.Container, startPosition: Position) {
    this.position = { ...startPosition };

    this.sprite = new PIXI.Graphics();
    this.drawShuriken();
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;

    container.addChild(this.sprite);
  }

  private drawShuriken(): void {
    // Four-pointed star shape
    this.sprite.beginFill(0x888888);
    this.sprite.lineStyle(2, 0x666666);

    const size = 8;
    this.sprite.moveTo(0, -size);
    this.sprite.lineTo(size / 3, -size / 3);
    this.sprite.lineTo(size, 0);
    this.sprite.lineTo(size / 3, size / 3);
    this.sprite.lineTo(0, size);
    this.sprite.lineTo(-size / 3, size / 3);
    this.sprite.lineTo(-size, 0);
    this.sprite.lineTo(-size / 3, -size / 3);
    this.sprite.lineTo(0, -size);

    this.sprite.endFill();
  }

  update(): void {
    if (!this.active) return;

    this.position.x += this.speed;
    this.sprite.x = this.position.x;

    // Rotate for visual effect
    this.sprite.rotation += 0.3;

    // Remove if off screen
    if (this.position.x > window.innerWidth + 100) {
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
