import * as PIXI from 'pixi.js';
import { Fluid } from './Fluid';
import { Particle } from './Particle';

export interface RenderOptioins {
    scale?: number;
    width?: number;
    height?: number;
}

export class Render {
    options: {
        scale: number,
    };
    renderer: PIXI.Renderer;
    stage: PIXI.Container;
    sprites: Map<number, PIXI.Container> = new Map();
    fluid: Fluid;
    particlesCountText: PIXI.Text = new PIXI.Text('', {
        fontSize: 2,
        fill: PIXI.utils.rgb2hex([0.9, 0.9, 0.9]),
    });
    private spriteId: number = 0;

    constructor (fluid: Fluid, options: RenderOptioins = {}) {
        this.fluid = fluid;

        const width: number = options.width ?? 800;
        const height: number = options.height ?? 600;

        this.options = {
            scale: 5,
        };

        const canvas = this.createCanvas(width, height);
        canvas.id = 'canvas';
        document.body.appendChild(canvas);
        this.renderer = new PIXI.Renderer({
            width,
            height,
            view: canvas,
            antialias: true,
            backgroundColor: PIXI.utils.rgb2hex([0.2, 0.2, 0.2]),
        });
        this.stage = new PIXI.Container();
        
        this.stage.addChild(this.particlesCountText);

        this.options.scale = options.scale ?? this.options.scale;


        this.particlesCountText.resolution = 10;
        this.particlesCountText.position.set(40, -40);
    }
    
    update (delta: number) {

        this.stage.scale.set(this.options.scale, this.options.scale);
        this.stage.pivot.set(-this.renderer.width / (this.options.scale) * 0.5, -this.renderer.height / (this.options.scale) * 0.5);

        for (const particle of this.fluid.particles) {

            let sprite = this.sprites.get(particle.id);
            if (!sprite) {
                sprite = this.createCircleSprite(particle);
                this.sprites.set(particle.id, sprite);
                this.stage.addChild(sprite);
            }

            sprite.position.x = particle.position.x;
            sprite.position.y = particle.position.y;
        }

        this.particlesCountText.text = `particlesCount: ${this.fluid.particles.size}`;        
        this.renderer.render(this.stage);
    }

    private createCircleSprite (paricle: Particle): PIXI.Container {
        const sprite = new PIXI.Graphics();

        sprite.alpha = 0.4;
        sprite.beginFill(PIXI.utils.rgb2hex([0.1, 0.5, 0.9]));
        const p = [];

        const count = 20;
        for (let i = 0; i < count; ++i) {
            p.push(Math.sin(i/count * Math.PI * 2) * (this.fluid.radius??1), Math.cos(i/count * Math.PI * 2) * (this.fluid.radius??1));
        }
        sprite.drawPolygon(p);
        sprite.endFill();

        return sprite;
    }

    private randomColor (): number {
        return PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()]);
    }

    createCanvas (width: number, height: number) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.right = '0';
        canvas.style.bottom = '0';
        canvas.width = width;
        canvas.height = height;
        canvas.oncontextmenu = () => false;
        return canvas;
    }
}