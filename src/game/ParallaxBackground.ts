import * as PIXI from "pixi.js";
import type { Bounds } from "./types";

interface Cloud {
  graphics: PIXI.Graphics;
  speed: number;
  x: number;
  width: number;
}

export class ParallaxBackground {
  private container: PIXI.Container;
  private layers: PIXI.Graphics[] = [];
  private layerCount = 5;
  private screenHeight: number;
  private screenWidth: number;
  private sun: PIXI.Graphics | null = null;
  private clouds: Cloud[] = [];

  constructor(
    screenWidth: number,
    screenHeight: number,
    container: PIXI.Container,
    floorHeight: number
  ) {
    this.container = container;
    this.screenHeight = screenHeight;
    this.screenWidth = screenWidth;
    this.createSun(screenWidth, screenHeight);
    this.createClouds(screenWidth, screenHeight);
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

  private createSun(screenWidth: number, screenHeight: number): void {
    const sun = new PIXI.Graphics();
    const sunRadius = screenWidth * 0.08;
    const sunX = screenWidth * 0.75; // Position sun in upper right area
    const sunY = screenHeight * 0.25; // Position in upper portion of screen

    // Main sun (bright yellow-orange)
    sun.circle(sunX, sunY, sunRadius);
    sun.fill(0xffd700);

    // Inner highlight
    sun.circle(sunX - sunRadius * 0.3, sunY - sunRadius * 0.3, sunRadius * 0.3);
    sun.fill({ color: 0xffffff, alpha: 0.8 });

    this.sun = sun;
    // Add sun first so it appears behind mountains
    this.container.addChild(sun);
  }

  private createClouds(screenWidth: number, screenHeight: number): void {
    const cloudCount = 8; // Number of clouds
    const skyStart = screenHeight * 0.1; // Clouds start at 10% of screen height
    const skyHeight = screenHeight * 0.5; // Clouds occupy top 50% of screen

    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.createSingleCloud();

      // Position clouds randomly across the sky
      const cloudX = Math.random() * screenWidth * 2; // Spread clouds wider
      const cloudY = skyStart + Math.random() * skyHeight;

      cloud.graphics.x = cloudX;
      cloud.graphics.y = cloudY;

      // Different speeds for parallax effect (slower = more distant)
      const speed = 0.02 + Math.random() * 0.05; // Random speed between 0.02 and 0.07

      this.clouds.push({
        graphics: cloud.graphics,
        speed: speed,
        x: cloudX,
        width: cloud.width,
      });

      this.container.addChild(cloud.graphics);
    }
  }

  private createSingleCloud(): { graphics: PIXI.Graphics; width: number } {
    const cloud = new PIXI.Graphics();
    const baseSize = 60 + Math.random() * 80; // Variable cloud size
    const width = baseSize * 1.5;
    const height = baseSize * 0.6;

    // Create fluffy cloud using overlapping ovals/ellipses
    const numShapes = 3 + Math.floor(Math.random() * 3); // 3-5 shapes per cloud
    const centerX = width / 2;
    const centerY = height / 2;

    // White clouds with slight transparency for depth
    const alpha = 0.8 + Math.random() * 0.2; // 0.7 to 1.0

    for (let i = 0; i < numShapes; i++) {
      const offsetX = (Math.random() - 0.5) * width * 0.6;
      const offsetY = (Math.random() - 0.5) * height * 0.6;
      const baseShapeSize = baseSize * (0.4 + Math.random() * 0.4);

      // Make ellipses oval (always wider than tall)
      const stretchX = 1.0 + Math.random() * 0.5; // 1.0 to 1.5 (horizontal stretch)
      const stretchY = 0.5 + Math.random() * 0.4; // 0.5 to 0.9 (vertical stretch, always less than horizontal)
      const ellipseWidth = baseShapeSize * stretchX;
      const ellipseHeight = baseShapeSize * stretchY;

      cloud.ellipse(
        centerX + offsetX,
        centerY + offsetY,
        ellipseWidth,
        ellipseHeight
      );
    }

    cloud.fill({ color: 0xffffff, alpha: alpha });

    return { graphics: cloud, width: width };
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

    // Move clouds at their individual speeds (slow parallax effect)
    for (const cloud of this.clouds) {
      cloud.graphics.x -= speed * cloud.speed;
      cloud.x = cloud.graphics.x;

      // Reset cloud position when it scrolls off screen (wrap around)
      if (cloud.x <= -cloud.width) {
        cloud.x += this.screenWidth * 2 + cloud.width;
        cloud.graphics.x = cloud.x;
      }
    }

    // Sun moves very slowly for subtle parallax effect
    if (this.sun) {
      this.sun.x -= speed * 0.01;
      // Reset sun position when it goes off screen
      if (this.sun.x <= -this.screenWidth * 0.5) {
        this.sun.x += this.screenWidth * 2;
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
