import { Fluid } from '../Fluid';
import { ParticlePair } from './ParticlePair';
import { ParticleManager } from './Manager';
import { Vector } from 'quark2d';

export class FluidNarrowphase {
    manager: ParticleManager;
    fluid: Fluid;

    constructor (manager: ParticleManager) {
        this.manager = manager;
        this.fluid = manager.fluid;
    }

    update (pairs: Iterable<ParticlePair>) {

        let normal: Vector;
        for (const pair of pairs) {
            if (pair.particleA.aabb.overlaps(pair.particleB.aabb)) {

                normal = Vector.subtract(pair.particleA.position, pair.particleB.position, pair.normal);

                const lengthSquared = normal.lengthSquared();

                if (lengthSquared > this.fluid.maxDistSquared) continue;
                if (lengthSquared === 0) {
                    normal.set(0, 1);
                    pair.dist = 0.001;
                } else {
                    const length = Math.sqrt(lengthSquared);
                    pair.dist = length;
                    normal.divide(length);
                }

                this.manager.activePairs.push(pair);
                pair.particleA.pairs.push(pair);
                pair.particleB.pairs.push(pair);
            }
        }
    }
}