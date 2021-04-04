import { Vector } from 'quark2d';
import { Particle } from '../Particle';


export class ParticlePair {
    particleA: Particle;
    particleB: Particle;
    normal: Vector = new Vector();
    dist: number = 0;
    q: number = 0;
    cellsCount: number = 0;

    constructor (particleA: Particle, particleB: Particle) {
        this.particleA = particleA;
        this.particleB = particleB;
    }

}