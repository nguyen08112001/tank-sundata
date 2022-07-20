import { IImageConstructor } from '../../interfaces/image.interface';
import { GameScene } from '../../scenes/GameScene';

export class Barrel extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private health: number;

    // game objects
    private bullets: Phaser.GameObjects.Group;
    explosionSound: Phaser.Sound.BaseSound;
    tween: Phaser.Tweens.Tween;

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        this.initImage();
        this.scene.add.existing(this);
    }

    private initImage() {
        // variables
        this.health = 1;

        // image
        this.setDepth(0);

        this.explosionSound = this.scene.sound.add('explosion')

        // physics
        this.scene.physics.world.enable(this);
        this.body.setImmovable(true)
    }

    public updateHealth(_x: number, _y:number): void {
        this.kill()
        if (this.health > 0) {
            this.health -= 0.05;
            
            this.createEmitter(_x, _y)
        } else {
            this.kill()
        }
    }

    kill() {
        if (!this.active) return;

        this.health = 0;
        this.active = false;
        this.setVisible(false)
        
        this.createDeadZone()
        this.createExplosionEffect()
        
        this.destroy()
    }

    private createExplosionEffect() {
        var particles = this.scene.add.particles('explosion');

        particles.createEmitter({
            frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],
            angle: { min: 240, max: 300 },
            speed: { min: 200, max: 300 },
            quantity: 6,
            lifespan: 2000,
            alpha: { start: 1, end: 0 },
            scale: { start: 1.5, end: 0.5 },
            on: false
        });

        particles.createEmitter({
            frame: 'red',
            angle: { start: 0, end: 360, steps: 32 },
            lifespan: 1000,
            speed: 400,
            quantity: 32,
            scale: { start: 0.3, end: 0 },
            on: false
        });

        particles.createEmitter({
            frame: 'stone',
            angle: { min: 240, max: 300 },
            speed: { min: 400, max: 600 },
            quantity: { min: 2, max: 10 },
            lifespan: 4000,
            alpha: { start: 1, end: 0 },
            scale: { min: 0.05, max: 0.4 },
            rotate: { start: 0, end: 360, ease: 'Back.easeOut' },
            gravityY: 800,
            on: false
        });

        particles.createEmitter({
            frame: 'muzzleflash2',
            lifespan: 200,
            scale: { start: 2, end: 0 },
            rotate: { start: 0, end: 180 },
            on: false
        });
        particles.emitParticleAt(this.x, this.y)
    }
    private createDeadZone() {
        var zone = this.scene.add.zone(this.x, this.y, 200, 200);
        this.scene.physics.world.enable(zone, 1); // (0) DYNAMIC (1) STATIC
        var tmp = this.scene as GameScene
        this.scene.physics.add.overlap(tmp.player, zone, () => {
            tmp.player.updateHealth(0,0, 100)
        })
        this.scene.physics.add.overlap(tmp.enemies, zone, (_a: any, _b: any) => {
            _a.health = 0;
            this.active = false;
            _a.kill()
        })
        this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                zone.destroy();
            }
        })
    }

    private createEmitter(_x: number, _y:number) {
        var emitter = this.scene.add.particles('red-spark').createEmitter({
            x: _x,
            y: _y,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            //active: false,
            lifespan: 200,
            gravityY: 800,
        });
        this.scene.time.delayedCall(200, ()=>{
            emitter.stop();
        });
    }


}
