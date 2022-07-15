import { PauseScene } from './../scenes/pause-scene';
import { Bullet } from './bullet';
import { IImageConstructor } from '../interfaces/image.interface';
import { GameScene } from '../scenes/game-scene';

export class Enemy extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private health: number;
    private lastShoot: number;
    private speed: number;

    // children
    private barrel: Phaser.GameObjects.Image;
    private lifeBar: Phaser.GameObjects.Graphics;

    // game objects
    private bullets: Phaser.GameObjects.Group;
    explosionSound: Phaser.Sound.BaseSound;
    tween: Phaser.Tweens.Tween;

    public getBarrel(): Phaser.GameObjects.Image {
        return this.barrel;
    }

    public getBullets(): Phaser.GameObjects.Group {
        return this.bullets;
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

        this.initContainer();
        this.scene.add.existing(this);
    }

    private initContainer() {
        // variables
        this.health = 1;
        this.lastShoot = 0;
        this.speed = 100;

        // image
        this.setDepth(0);

        this.barrel = this.scene.add.image(0, 0, 'barrelRed');
        this.barrel.setOrigin(0.5, 1);
        this.barrel.setDepth(1);

        this.explosionSound = this.scene.sound.add('explosion')

        this.lifeBar = this.scene.add.graphics();
        this.redrawLifebar();

        // game objects
        this.bullets = this.scene.add.group({
        /*classType: Bullet,*/
        active: true,
        maxSize: 10,
        runChildUpdate: true
        });

        // tweens
        this.tween = this.scene.tweens.add({
        targets: this,
        props: { y: this.y - 200 },
        delay: 0,
        duration: 2000,
        ease: 'Linear',
        easeParams: null,
        hold: 0,
        repeat: -1,
        repeatDelay: 0,
        yoyo: true
        });

        // physics
        this.scene.physics.world.enable(this);
    }

    update(): void {
        if (this.active) {
        this.barrel.x = this.x;
        this.barrel.y = this.y;
        this.lifeBar.x = this.x;
        this.lifeBar.y = this.y;
        this.handleShooting();
        } else {
        this.destroy();
        this.barrel.destroy();
        this.lifeBar.destroy();
        }
    }

    private handleShooting(): void {
        if (this.scene.time.now > this.lastShoot) {
            if (this.bullets.getLength() < 10) {
                    this.bullets.add(
                        new Bullet({
                            scene: this.scene,
                            rotation: this.barrel.rotation,
                            x: this.barrel.x,
                            y: this.barrel.y,
                            texture: 'bulletRed'
                        })
                );

                this.lastShoot = this.scene.time.now + 400;
            }
        }
    }

    private redrawLifebar(): void {
        this.lifeBar.clear();
        this.lifeBar.fillStyle(0xe66a28, 1);
        this.lifeBar.fillRect(
            -this.width / 2,
            this.height / 2,
            this.width * this.health,
            15
        );
        this.lifeBar.lineStyle(2, 0xffffff);
        this.lifeBar.strokeRect(-this.width / 2, this.height / 2, this.width, 15);
        this.lifeBar.setDepth(1);
    }

    public updateHealth(_x: number, _y:number): void {
        if (this.health > 0) {
        this.health -= 0.05;
        this.redrawLifebar();

        this.createEmitter(_x, _y)
            
        } else {
            this.body.checkCollision.none = true
            const level = this.scene.scene.get('GameScene') as GameScene
            level.score+=100
            level.tweens.add({
                targets: level.scoreText,
                props: {
                    scale: 2
                },
                ease: 'Sine.easeInOut',
                duration: 300,
                yoyo: true,
            })
            this.kill()
            if (level.enemies.countActive() === 1) {
                this.scene.physics.world.timeScale = 10
                this.scene.time.timeScale = 10
                this.scene.cameras.main.setAlpha(0.5)
                // this.scene.scene.pause()
                this.scene.scene.launch('VictoryScene', { score: level.score })
            }
            
        }
    }

    kill() {
        this.tween.stop()
        this.scene.tweens.add({
            targets: this,
            props: {
                scaleX: 2,
                scaleY: 2
            },
            ease: 'Sine.easeInOut',
            duration: 300,
            onComplete: () => {
                this.explosionSound.play()
                this.health = 0;
                this.active = false;
            }
    })

        var particles = this.scene.add.particles('flares').createEmitter({
            frame: 'red',
            x: this.x, y: this.y,
            lifespan: { min: 600, max: 800 },
            angle: { start: 0, end: 360, steps: 64 },
            speed: 200,
            quantity: 64,
            scale: { start: 0.2, end: 0.1 },
            frequency: 32,
            blendMode: 'ADD'
        });

        this.scene.time.delayedCall(100, ()=>{
            particles.stop();
        });
    }

    createEmitter(_x: number, _y:number) {
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
