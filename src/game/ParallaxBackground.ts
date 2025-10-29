import * as PIXI from "pixi.js";
import type { Bounds } from "./types";

export class ParallaxBackground {
  private container: PIXI.Container;
  private layers: PIXI.Graphics[] = [];
  private layerCount = 5;
  private screenHeight: number;

  constructor(
    screenWidth: number,
    screenHeight: number,
    container: PIXI.Container
  ) {
    this.container = container;
    this.screenHeight = screenHeight;
    this.createLayers(screenWidth, screenHeight);
  }

  private createLayers(screenWidth: number, screenHeight: number): void {
    // Daylight palette: distant layers are lighter/desaturated, foreground is richer
    const colors = [
      0xb7e4c7, // Pale mint green (backmost)
      0x95d5b2, // Light desaturated green
      0x74c69d, // Soft green
      0x52b788, // Mid green
      0x2d6a4f, // Rich forest green (foreground)
    ];

    for (let i = 0; i < this.layerCount; i++) {
      const layer = new PIXI.Graphics();
      const color = colors[i];
      const segments = i === 0 ? 3 : 5; // bizarre pattern for parallax effect

      // Create repeating segments
      for (let j = 0; j < segments; j++) {
        layer.beginFill(color);

        // Create irregular terrain shapes
        const startX = j * screenWidth + (Math.random() - 0.5) * 100;
        const variance = 50 + Math.random() * 100;

        layer.drawPolygon([
          startX,
          screenHeight - 50 - variance,
          startX + screenWidth / segments,
          screenHeight - 30 - variance * 0.8,
          startX + screenWidth / segments,
          screenHeight,
          startX,
          screenHeight,
        ]);

        layer.endFill();

        // Add some decorative elements
        if (Math.random() > 0.7) {
          const treeX = startX + screenWidth / segments / 2;
          // Slightly darker trunk/accent for daylight
          layer.beginFill(color - 0x001010);
          layer.drawRect(
            treeX - 5,
            screenHeight - 80 - variance,
            10,
            30 + variance
          );
          layer.endFill();
        }
      }

      this.layers.push(layer);
      this.container.addChild(layer);
    }
  }

  update(speed: number): void {
    // Move layers at different speeds for parallax effect
    for (let i = 0; i < this.layers.length; i++) {
      const layerSpeed = speed * (0.2 + i * 0.15);
      this.layers[i].x -= layerSpeed;

      // Reset layer position when it scrolls off screen
      if (this.layers[i].x <= -this.layers[i].width) {
        this.layers[i].x = 0;
      }
    }
  }

  getBounds(): Bounds {
    return {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: this.screenHeight - 100, // Ground level
    };
  }
}
