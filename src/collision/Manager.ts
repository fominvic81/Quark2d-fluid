import { Fluid } from '../Fluid';
import { FluidBroadphase } from './Broadphase';
import { FluidNarrowphase } from './Narrowphase';
import { ParticlePair } from './ParticlePair';



export class ParticleManager {
    fluid: Fluid;
    broadphase: FluidBroadphase;
    narrowphase: FluidNarrowphase;
    pairs: Map<number, ParticlePair> = new Map();
    activePairs: ParticlePair[] = [];

    constructor (fluid: Fluid) {
        this.fluid = fluid;

        this.broadphase = new FluidBroadphase(this);
        this.narrowphase = new FluidNarrowphase(this);
    }

    update () {
        this.activePairs.length = 0;

        this.narrowphase.update(this.broadphase.update());
    }
}