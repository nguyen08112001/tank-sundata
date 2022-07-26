import { PauseScene } from '../scenes/PauseScene';
import { Bullet } from './Bullet';
import { IImageConstructor } from '../interfaces/image.interface';
import { GameScene } from '../scenes/GameScene';

export class Enemy extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private health: number;
    private nextShoot: number;
    public damage: number;

    // children
    private barrel: Phaser.GameObjects.Image;
    private lifeBar: Phaser.GameObjects.Graphics;

    // game objects
    private bullets: Phaser.GameObjects.Group;
    private explosionSound: Phaser.Sound.BaseSound;
    private tween: Phaser.Tweens.Tween;
    private whiteSmoke: Phaser.GameObjects.Particles.ParticleEmitter;
    private darkSmoke: Phaser.GameObjects.Particles.ParticleEmitter;
    private fire: Phaser.GameObjects.Particles.ParticleEmitter;

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
        this.nextShoot = 0;
        this.damage = 0.5

        // image
        this.setDepth(0);

        this.barrel = this.scene.add.image(0, 0, 'barrelRed');
        this.barrel.setOrigin(0.5, 1);
        this.barrel.setDepth(1);

        //sound
        this.explosionSound = this.scene.sound.add('explosion');

        this.lifeBar = this.scene.add.graphics();
        this.reDrawLifebar();

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
        if (this.scene.time.now > this.nextShoot && this.bullets.getLength() < 10) {

            this.bullets.add(
                new Bullet({
                    scene: this.scene,
                    rotation: this.barrel.rotation,
                    x: this.barrel.x,
                    y: this.barrel.y,
                    texture: 'bulletRed',
                    damage: this.damage
                })
            );

            this.nextShoot = this.scene.time.now + 400;
        }
    }

    private reDrawLifebar(): void {
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
            this.reDrawLifebar();

            this.createGotHitEffect(_x, _y)

            if (this.health <= 0.7) {
                this.createSmoke()
            } 
            if (this.health <= 0.4) {
                this.createFire()
            }
        } else {
            this.kill()
        }
    }

    kill() {
        this.body.checkCollision.none = true;

        this.createDeadEffect();
        this.createIncreaseScoreEffect();
        this.checkEndGame();
    }
    private createDeadEffect() {
        this.tween.stop()
        this.fire?.stop()
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

    private checkEndGame() {
        const level = this.scene.scene.get('GameScene') as GameScene

        if (level.enemies.countActive() === 1) {
            this.scene.physics.world.timeScale = 10
            this.scene.time.timeScale = 10
            this.scene.cameras.main.setAlpha(0.5)
            this.scene.scene.launch('VictoryScene', { score: level.score + 100})
        }
    }

    private createIncreaseScoreEffect() {
        const level = this.scene.scene.get('GameScene') as GameScene

        level.time.addEvent({
            delay: 1000,
            callback: () => {
                level.score+=100;
                level.tweens.add({
                    targets: level.scoreText,
                    props: {
                        scale: 2
                    },
                    ease: 'Sine.easeInOut',
                    duration: 300,
                    yoyo: true,
                })
            }
        })

        const particleEffects = this.scene.scene.get('particle-effects')
        particleEffects.events.emit('trail-to', {
            fromX: this.x ,
            fromY: this.y,
            toX: 450 + 200,
            toY: 50
        })
        
    }

    createGotHitEffect(_x: number, _y:number) {
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
        }).explode(10, _x, _y);
    }

    private createFire() {
        if (this.fire) return

        this.whiteSmoke.stop();
        this.darkSmoke.stop();
        this.fire = this.scene.add.particles('fire').createEmitter({
            alpha: { start: 1, end: 0 },
            scale: { start: 0.5, end: 2.5 },
            tint: { start: 0xff945e, end: 0xff945e },
            speed: 20,
            accelerationY: -300,
            angle: { min: -85, max: -95 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 1000, max: 1100 },
            blendMode: 'ADD',
            frequency: 110,
            follow: this
        });

    }
    private createSmoke() {
        if (this.whiteSmoke) return

        this.whiteSmoke = this.scene.add.particles('white-smoke').createEmitter({
            x: 400,
            y: 300,
            speed: { min: 20, max: 100 },
            angle: { min: 0, max: 360},
            scale: { start: 1, end: 0},
            alpha: { start: 0, end: 0.5},
            lifespan: 2000,
            //active: false,
            follow: this
        });
        this.whiteSmoke.reserve(1000);
    
        this.darkSmoke = this.scene.add.particles('dark-smoke').createEmitter({
            x: 400,
            y: 300,
            speed: { min: 20, max: 100 },
            angle: { min: 0, max: 360},
            scale: { start: 1, end: 0},
            alpha: { start: 0, end: 0.1},
            blendMode: 'SCREEN',
            lifespan: 2000,
            //active: false
            follow: this
        });
        this.darkSmoke.reserve(1000);
    }

}
