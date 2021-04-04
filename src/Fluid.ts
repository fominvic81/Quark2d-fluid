import { AABB, Vector } from 'quark2d';
import { Particle, ParticleOptions } from './Particle';
import { ParticleManager } from './collision/Manager';
import { FluidSolver } from './solver/Solver';

interface FluidOptions {
    restDensity?: number;
    radius?: number;
    visc?: number;
    visc_quad?: number;
    aabb?: AABB;
    gravity?: Vector;
    k?: number;
}

export class Fluid {
    particles: Set<Particle> = new Set();
    aabb: AABB = new AABB().setNum(-50, -50, 50, 50);
    manager: ParticleManager;
    solver: FluidSolver;
    radius: number = 1;
    maxDist: number = 2;
    maxDistSquared: number = 4;
    gravity: Vector = new Vector(0, 9.8);
    restDensity: number;
    visc: number;
    visc_quad: number;
    k: number = 0.2;

    constructor (options: FluidOptions = {}) {
        this.restDensity = options.restDensity ?? 1;
        this.visc = options.visc ?? 0.15;
        this.visc_quad = options.visc_quad ?? 0.05;
        this.k = options.k ?? 0.3;

        if (options.aabb) options.aabb.clone(this.aabb);
        if (options.gravity) options.gravity.clone(this.gravity);

        this.setRadius(options.radius ?? 1);

        this.manager = new ParticleManager(this);
        this.solver = new FluidSolver(this);
    }

    setRadius (radius: number) {
        this.radius = radius;
        this.maxDist = this.radius * 2;
        this.maxDistSquared = Math.pow(this.maxDist, 2);
    }

    update (delta: number) {
        this.applyGravity(delta);
        for (const particle of this.particles) {
            particle.update();
        }
        this.updateBounds();

        this.manager.update();
        this.solver.update(this.manager.activePairs);
    }

    add (options: ParticleOptions = {}) {
        const particle = new Particle(this, options);

        this.particles.add(particle);
        return particle;
    }

    private applyGravity (delta: number) {
        const gravity = this.gravity.scale(delta * delta, Vector.temp[0]);
        for (const particle of this.particles) {
            particle.velocity.add(gravity);
        }
    }

    private updateBounds () {

        const broadphase = this.manager.broadphase;
        const grid = this.manager.broadphase.grid;
        for (let i = 0; i <= broadphase.width; ++i) {
            for (const particle of grid[i][0].values()) {
                if (particle.position.y - this.radius < this.aabb.min.y) {
                    particle.velocity.y += (this.aabb.min.y - (particle.position.y - this.radius)) * 0.1;
                    particle.position.y = this.aabb.min.y + this.radius;
                }
            }
            for (const particle of grid[i][broadphase.height].values()) {
                if (particle.position.y + this.radius > this.aabb.max.y) {
                    particle.velocity.y += (this.aabb.max.y - (particle.position.y + this.radius)) * 0.1;
                    particle.position.y = this.aabb.max.y - this.radius;
                }
            }
        }
        for (let i = 0; i <= broadphase.height; ++i) {
            for (const particle of grid[0][i].values()) {
                if (particle.position.x - this.radius < this.aabb.min.x) {
                    particle.velocity.x += (this.aabb.min.x - (particle.position.x - this.radius)) * 0.1;
                    particle.position.x = this.aabb.min.x + this.radius;
                }
            }
            for (const particle of grid[broadphase.width][i].values()) {
                if (particle.position.x + this.radius > this.aabb.max.x) {
                    particle.velocity.x += (this.aabb.max.x - (particle.position.x + this.radius)) * 0.1;
                    particle.position.x = this.aabb.max.x - this.radius;
                }
            }
        }
    }
}