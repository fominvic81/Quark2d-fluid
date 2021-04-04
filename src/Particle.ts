import { AABB, Common, Vector } from 'quark2d';
import { Fluid } from './Fluid';
import { Region } from './collision/Broadphase';
import { ParticlePair } from './collision/ParticlePair';

export interface ParticleOptions {
    position?: Vector,   
}

export class Particle {
    id: number = Common.nextId('particle');
    fluid: Fluid;
    velocity: Vector = new Vector();
    position: Vector = new Vector();
    prevPosition: Vector = new Vector();
    aabb: AABB = new AABB();
    pairs: ParticlePair[] = [];
    density: number = 0;
    pressure: number = 0;
    region: Region = new Region();

    constructor (fluid: Fluid, options: ParticleOptions = {}) {
        this.fluid = fluid;
        if (options.position) options.position.clone(this.position);
    }

    update () {

        this.position.clone(this.prevPosition);
        
        this.position.add(this.velocity);
        this.updateAABB();


        this.pairs.length = 0;
    }

    updateAABB () {
        this.aabb.setNum(-this.fluid.radius, -this.fluid.radius, this.fluid.radius, this.fluid.radius);
        this.aabb.translate(this.position);
    }
}