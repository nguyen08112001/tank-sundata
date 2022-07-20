import { Enemy } from './Enemy';
import { IBulletConstructor } from '../interfaces/bullet.interface';
import { GameScene } from '../scenes/GameScene';

export class Bomb extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    private bombSpeed: number;

    constructor(aParams: IBulletConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture);
        this.rotation = aParams.rotation;
        this.initImage();
        this.scene.add.existing(this);
    }

    private initImage(): void {
        // variables
        this.bombSpeed = 1000;

        // image
        this.setOrigin(0.5, 0.5);
        this.setScale(0.2);

        // physics
        this.scene.physics.world.enable(this);
        this.scene.physics.velocityFromRotation(
            this.rotation - Math.PI / 2,
            this.bombSpeed,
            this.body.velocity
        );
        this.body.setSize(this.width/2,this.height/2)
        this.body.setBounce(1, 1)

        //init tweens
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 500,
            repeat: -1,
            ease: 'Power0'
        })
    }


    kill() {
        this.createDeadZone();
        this.createExplosionEmitter();
        this.destroy();
    }

    private createExplosionEmitter() {
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
        var gameScene = this.scene as GameScene;
        this.scene.physics.add.overlap(gameScene.player, zone, () => {
            gameScene.player.updateHealth(0,0, 100);
        })
        this.scene.physics.add.overlap(gameScene.enemies, zone, (_enemy: Enemy, _zone: any) => {
            _enemy.kill();
        })
        this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                zone.destroy()
            }
        })
    }
}
