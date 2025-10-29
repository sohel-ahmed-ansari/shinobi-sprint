import * as PIXI from "pixi.js";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  sprite?: PIXI.Graphics;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private container: PIXI.Container;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  createExplosion(
    x: number,
    y: number,
    color: number = 0x888888,
    count: number = 15
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 3 + Math.random() * 5;

      const particle: Particle = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 30 + Math.random() * 30,
        size: 4 + Math.random() * 6,
        color,
      };

      const sprite = new PIXI.Graphics();
      sprite
        .circle(0, 0, particle.size)
        .fill({ color: particle.color, alpha: 0.8 });
      sprite.x = particle.x;
      sprite.y = particle.y;

      particle.sprite = sprite;
      this.container.addChild(sprite);
      this.particles.push(particle);
    }
  }

  createDust(x: number, y: number, color: number = 0xcccccc): void {
    for (let i = 0; i < 10; i++) {
      const particle: Particle = {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: -2 - Math.random() * 3,
        vy: -1 + Math.random() * 2,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        size: 3 + Math.random() * 5,
        color,
      };

      const sprite = new PIXI.Graphics();
      sprite
        .circle(0, 0, particle.size)
        .fill({ color: particle.color, alpha: 0.6 });
      sprite.x = particle.x;
      sprite.y = particle.y;

      particle.sprite = sprite;
      this.container.addChild(sprite);
      this.particles.push(particle);
    }
  }

  update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravity
      particle.life++;

      // Update sprite
      if (particle.sprite) {
        particle.sprite.x = particle.x;
        particle.sprite.y = particle.y;

        // Fade out
        const lifeRatio = particle.life / particle.maxLife;
        particle.sprite.alpha = 1 - lifeRatio;
        particle.sprite.scale.set(1 - lifeRatio * 0.5);
      }

      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        if (particle.sprite) {
          this.container.removeChild(particle.sprite);
          particle.sprite.destroy();
        }
        this.particles.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const particle of this.particles) {
      if (particle.sprite) {
        this.container.removeChild(particle.sprite);
        particle.sprite.destroy();
      }
    }
    this.particles = [];
  }
}
