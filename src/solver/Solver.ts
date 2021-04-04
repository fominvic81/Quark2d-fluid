import { Vector } from 'quark2d';
import { ParticlePair } from '../collision/ParticlePair';
import { Fluid } from '../Fluid';

export class FluidSolver {
    fluid: Fluid;

    private static temp = [new Vector(), new Vector(), new Vector(), new Vector()];

    constructor (fluid: Fluid) {
        this.fluid = fluid;
    }


    update (pairs: Iterable<ParticlePair>) {

        this.solveVisc(pairs);
        this.computeDensityAndPressure();
        this.solve(pairs);

    }

    computeDensityAndPressure () {
        for (const particle of this.fluid.particles) {
            particle.density = 0;
            
            for (const pair of particle.pairs) {
                pair.q = pair.dist/this.fluid.maxDist
                
                particle.density += Math.pow(1 - pair.q, 2);
            }
        }
        for (const particle of this.fluid.particles) {
            particle.pressure = this.fluid.k * (particle.density - this.fluid.restDensity);
        }
    }

    solve (pairs: Iterable<ParticlePair>) {

        const impulse = FluidSolver.temp[0];
        for (const pair of pairs) {

            const p = (pair.particleA.pressure + pair.particleB.pressure) * (1 - pair.q);

            pair.normal.scale(p * 0.5, impulse);

            pair.particleA.velocity.add(impulse);
            pair.particleB.velocity.subtract(impulse);
        }
    }

    solveVisc (pairs: Iterable<ParticlePair>) {
        const visc = this.fluid.visc;
        const visc_quad = this.fluid.visc_quad;

        const v = FluidSolver.temp[0];
        const impulse = FluidSolver.temp[1];

        for (const pair of pairs) {
            Vector.subtract(pair.particleA.velocity, pair.particleB.velocity, v);
            const u = Vector.dot(pair.normal, v);

            if (u < 0) continue;

            pair.normal.scale((1 - pair.q) * (visc * u + visc_quad * u * u) * 0.5, impulse);

            pair.particleA.velocity.subtract(impulse);
            pair.particleB.velocity.add(impulse);
        }
    }

}