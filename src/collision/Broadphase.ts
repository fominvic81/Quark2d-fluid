import { AABB, Common, Grid, Vector } from 'quark2d';
import { Fluid } from '../Fluid';
import { ParticlePair } from './ParticlePair';
import { ParticleManager } from './Manager';
import { Particle } from '../Particle';

export class Region extends AABB {
    id: number = 0;

    static temp: Array<Region> = [new Region(), new Region()];

    constructor () {
        super();
    }

    updateId () {
        this.id = (this.min.x << 30) + (this.min.y << 20) + (this.max.x << 10) + this.max.y;
    }

    static combine (regionA: Region, regionB: Region, output: Region) {
        output.min.x = Math.min(regionA.min.x, regionB.min.x);
        output.min.y = Math.min(regionA.min.y, regionB.min.y);
        output.max.x = Math.max(regionA.max.x, regionB.max.x);
        output.max.y = Math.max(regionA.max.y, regionB.max.y);
    }
}

export class FluidBroadphase {
    manager: ParticleManager;
    fluid: Fluid;
    activePairs: Set<ParticlePair> = new Set();
    grid: Map<number, any>[][];
    gridSize: number;
    width: number;
    height: number;


    constructor (manager: ParticleManager) {
        this.manager = manager;
        this.fluid = manager.fluid;

        this.gridSize = this.fluid.radius * 2;

        this.width = Math.round(this.fluid.aabb.getWidth() / this.gridSize);
        this.height = Math.round(this.fluid.aabb.getHeight() / this.gridSize);

        this.grid = [];
        for (let i = 0; i <= this.width; ++i) {
            const r = [];
            for (let j = 0; j <= this.height; ++j) {
                r.push(new Map());
            }
            this.grid.push(r);
        }
    }

    update () {

        const region = Region.temp[0];
        const region2 = Region.temp[1];

        for (const particle of this.fluid.particles) {
            region.setNum(
                Common.clamp(Math.round((particle.aabb.min.x - this.fluid.aabb.min.x) / this.gridSize), 0, this.width),
                Common.clamp(Math.round((particle.aabb.min.y - this.fluid.aabb.min.y) / this.gridSize), 0, this.height),
                Common.clamp(Math.round((particle.aabb.max.x - this.fluid.aabb.min.x) / this.gridSize), 0, this.width),
                Common.clamp(Math.round((particle.aabb.max.y - this.fluid.aabb.min.y) / this.gridSize), 0, this.height),
            );
            region.updateId();

            if (particle.region.id !== 0) {
                if (region.id === particle.region.id) continue;

                Region.combine(region, particle.region, region2);

                const position = Vector.temp[0];
                for (let x = region2.min.x; x <= region2.max.x; ++x) {
                    for (let y = region2.min.y; y <= region2.max.y; ++y) {
                        position.set(x, y);

                        const insideOldRegion = particle.region.contains(position);
                        const insideNewRegion = region.contains(position);

                        if (insideOldRegion && !insideNewRegion) {
                            this.removeParticleFromCell(x, y, particle);
                        } else if (!insideOldRegion && insideNewRegion) {
                            this.addParticleToCell(x, y, particle);
                        }
                    }
                }
            } else {
                for (let x = region.min.x; x <= region.max.x; ++x) {
                    for (let y = region.min.y; y <= region.max.y; ++y) {
                        this.addParticleToCell(x, y, particle);
                    }
                }
            }
            region.clone(particle.region);
            particle.region.id = region.id;
        }
        return this.activePairs;
    }

    addParticleToCell (x: number, y: number, particle: Particle) {
        const cell = this.grid[x][y];

        for (const particleB of cell.values()) {
            const pairId = Common.combineId(particle.id, particleB.id);
            const p = this.manager.pairs.get(pairId);
            const pair = p || new ParticlePair(particle, particleB);

            if (!p) {
                this.manager.pairs.set(pairId, pair);
            }

            this.activePairs.add(pair);
            ++pair.cellsCount;
        }

        cell.set(particle.id, particle);
    }

    removeParticleFromCell (x: number, y: number, particle: Particle) {

        const cell = this.grid[x][y];

        cell.delete(particle.id);

        for (const particleB of cell.values()) {
            const pairId = Common.combineId(particle.id, particleB.id);
            const p = this.manager.pairs.get(pairId);
            const pair = p || new ParticlePair(particle, particleB);

            --pair.cellsCount;

            if (pair.cellsCount === 0) {
                this.activePairs.delete(pair);
            }
        }
    }
}