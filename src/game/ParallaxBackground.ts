import * as PIXI from "pixi.js";
import type { Bounds } from "./types";

export class ParallaxBackground {
  private container: PIXI.Container;
  private layers: PIXI.Graphics[] = [];
  private layerCount = 5;
  private screenHeight: number;
  private screenWidth: number;

  constructor(
    screenWidth: number,
    screenHeight: number,
    container: PIXI.Container,
    floorHeight: number
  ) {
    this.container = container;
    this.screenHeight = screenHeight;
    this.screenWidth = screenWidth;
    this.createLayers(screenWidth, screenHeight, floorHeight);
  }

  private createLayers(
    screenWidth: number,
    screenHeight: number,
    floorHeight: number
  ): void {
    // Mountain colors: mix of blue, pink, purple, and white across layers
    const colors = [
      0xf5f0ff, // Very light white-purple (farthest mountains)
      0xe6e6ff, // Light blue-white
      0xffd0e6, // Soft pink
      0xccb3ff, // Medium purple-blue
      0xb399e6, // Deep blue-purple (closest mountains)
    ];

    for (let i = 0; i < this.layerCount; i++) {
      const layer = new PIXI.Graphics();
      const color = colors[i];

      // More segments for smoother parallax scrolling
      const segments = 2 + i; // Distant layers have fewer segments for slower movement
      const segmentWidth = screenWidth * 1.5; // Make segments wider for seamless scrolling

      // Create mountain silhouettes for each segment
      for (let j = 0; j < segments; j++) {
        const startX = j * segmentWidth;
        // Draw mountains above the grass floor (grass height is 100px)
        const baseHeight = screenHeight - floorHeight;

        // Create mountain silhouette with peaks and valleys
        const points: number[] = [];

        // Number of peaks in this segment (varies per layer for visual variety)
        const numPeaks = 1 + Math.floor(Math.random() * 2);

        // Mountain height varies by layer (distant = shorter, close = taller)
        // Reduced heights: distant layers 8-15%, close layers 15-25%
        const maxHeight = screenHeight * 0.4; //(0.08 + i * 0.04);
        const minHeight = screenHeight * 0.05; //(0.05 + i * 0.02);

        // Generate smooth mountain silhouette with gentler slopes
        // Use more steps between peaks for smoother transitions
        const stepsPerPeak = 4; // More steps = gentler slopes
        const stepSize = segmentWidth / (numPeaks * stepsPerPeak);
        let currentX = startX;

        // Start from base
        points.push(currentX, baseHeight);

        // Generate peaks and valleys with gradual transitions
        for (let p = 0; p < numPeaks; p++) {
          // Calculate peak position
          const peakX = currentX + stepSize * stepsPerPeak;
          const peakHeight =
            minHeight + Math.random() * (maxHeight - minHeight);

          // Create gradual slope up to peak
          for (let step = 1; step <= stepsPerPeak; step++) {
            const x = currentX + stepSize * step;
            // Use a smooth curve for gradual ascent
            const progress = step / stepsPerPeak;
            const elevation = peakHeight * (progress * progress); // Quadratic curve for smoothness
            points.push(x, baseHeight - elevation);
          }

          // Create gradual slope down from peak
          if (p < numPeaks - 1) {
            // Descend to next valley before next peak
            const nextValleyHeight =
              minHeight + Math.random() * (maxHeight - minHeight) * 0.4;

            for (let step = 1; step <= stepsPerPeak; step++) {
              const x = peakX + stepSize * step;
              // Smooth descent to valley
              const progress = step / stepsPerPeak;
              const elevation =
                peakHeight * (1 - progress) + nextValleyHeight * progress;
              points.push(x, baseHeight - elevation);
            }
            currentX = peakX + stepSize * stepsPerPeak;
          } else {
            // Last peak - descend gradually back to base
            const descentSteps = stepsPerPeak;
            for (let step = 1; step <= descentSteps; step++) {
              const x = peakX + stepSize * step;
              const progress = step / descentSteps;
              // Smooth descent from peak to base
              const elevation = peakHeight * (1 - progress * progress);
              points.push(x, baseHeight - elevation);
            }
            currentX = peakX + stepSize * descentSteps;
          }
        }

        // End at base
        points.push(startX + segmentWidth, baseHeight);

        // Draw polygon using moveTo/lineTo path, then fill
        layer.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) {
          layer.lineTo(points[i], points[i + 1]);
        }
        layer.fill(color);
      }

      // Store layer width for seamless scrolling
      (layer as any).layerWidth = segmentWidth * segments;

      this.layers.push(layer);
      this.container.addChild(layer);
    }
  }

  update(speed: number): void {
    // Move layers at different speeds for parallax effect
    // Distant layers move slower, closer layers move faster
    for (let i = 0; i < this.layers.length; i++) {
      const layerSpeed = speed * (0.1 + i * 0.2);
      const layer = this.layers[i];
      layer.x -= layerSpeed;

      // Get the stored layer width
      const layerWidth = (layer as any).layerWidth || this.screenWidth * 2;

      // Reset layer position when it scrolls off screen for seamless loop
      if (layer.x <= -layerWidth) {
        layer.x += layerWidth;
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
