import { Bullet, BulletsPool } from './Bullet';
import { IImageConstructor } from '../interfaces/image.interface';
import { GameScene } from '../scenes/GameScene';
import { Bomb, BombsPool } from './Bomb';
import eventsCenter from '../scenes/EventsCenter';

export class Player extends Phaser.GameObjects.Container {
    body: Phaser.Physics.Arcade.Body;

    // variables
    private health: number;
    private nextShoot: number;
    private speed: number;
    private nextBomb: number;
    private damage: number;
    private shootingDelayTime: number;


    // children
    private barrel: Phaser.GameObjects.Image;
    private lifeBar: Phaser.GameObjects.Graphics;
    private tank: Phaser.GameObjects.Image;

    // game objects
    private bullets: BulletsPool;
    private bombs: BombsPool;

    // input
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private moveKeyLeft: Phaser.Input.Keyboard.Key;
    private moveKeyRight: Phaser.Input.Keyboard.Key;
    private moveKeyUp: Phaser.Input.Keyboard.Key;
    private moveKeyDown: Phaser.Input.Keyboard.Key;
    private spaceKey: Phaser.Input.Keyboard.Key;

    //sound
    private shootSound: Phaser.Sound.BaseSound;
    private hitSound: Phaser.Sound.BaseSound;

    //utils
    private _shield: Phaser.GameObjects.Sprite;
    private hasShield: boolean;

    //effect
    private whiteSmoke: Phaser.GameObjects.Particles.ParticleEmitter;
    private darkSmoke: Phaser.GameObjects.Particles.ParticleEmitter;
    private fire: Phaser.GameObjects.Particles.ParticleEmitter;
    

    getBullets(): Phaser.GameObjects.Group {
        return this.bullets;
    }

    gotHitWithDamage(_x: number, _y: number, _dame: number): void {
        if(this.getShield()) return;

        this.health -= _dame;
        this.hitSound.play()
        this.scene.cameras.main.shake(20, 0.005);

        this.createGotHitEffect(_x, _y);        
    }

    getBombs() {
        return this.bombs;
    }

    setShield(shield: boolean) {
        this._shield.setVisible(shield);
        this.hasShield = shield;
    }

    getShield () {
        return this.hasShield;
    }

    isDead() {
        return !this.active;
    }

    update(): void {
        this.updateLifebar()
        this.updateBarrel();
        this.handleInput();
        this.updateState();
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y);

        this.initContainer(aParams.texture);
        this.initProperties()
        this.initWeaponObject();
        this.initSound();
        this.initInput();
        this.initPhysic();

        this.scene.add.existing(this);
    }

    private initPhysic() {
        // physics
        this.scene.physics.world.enable(this);
        this.body.setOffset(-30, -30)
    }
    private initInput() {
        // input
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.moveKeyLeft = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.A
        );
        this.moveKeyRight = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.D
        );
        this.moveKeyUp = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.W
        );
        this.moveKeyDown = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.spaceKey = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
    }
    private initSound() {
        //sound
        this.shootSound = this.scene.sound.add('shoot');
        this.hitSound = this.scene.sound.add('hit');
    }
    private initProperties() {
        this.health = 1;
        this.nextShoot = 0;
        this.nextBomb = 0;
        this.speed = 300;
        this.damage = 0.05;
        this.shootingDelayTime = 80;
        this.setShield(false);
    }
    private initWeaponObject() {
        
        this.initBombsPool();
        this.initBulletsPool();

    }

    private initBombsPool() {
        this.bombs = new BombsPool(this.scene);
    }
    private initBulletsPool() {
        this.bullets = new BulletsPool(this.scene, {
            texture: 'bulletBlue',
            damage: this.damage,
        });
    }

    private createNewBullet() {
        return new Bullet({
            scene: this.scene,
            rotation: this.barrel.rotation,
            x: this.x,
            y: this.y,
            texture: 'bulletBlue',
            damage: this.damage
        })
    }

    private initContainer(texture: string) {
        //tank
        this.tank = this.scene.add.image(0, 0, texture)
        this.tank.setOrigin(0.5, 0.5);
        this.tank.setDepth(0);
        this.tank.angle = 180;
        this.add(this.tank)

        // barrel
        this.barrel = this.scene.add.image(0, 0, 'barrelBlue');
        this.barrel.setOrigin(0.5, 1);
        this.barrel.setDepth(1);
        this.barrel.angle = 180;
        this.add(this.barrel)

        //lifebar
        this.lifeBar = this.scene.add.graphics();
        this.add(this.lifeBar);

        //shield
        this._shield = this.scene.add.sprite(0, 0, 'shield')
            .setOrigin(0.5, 0.5)
            .setScale(0.3)
            .setDepth(1);
        this.add(this._shield);

    }

    private handleBomb() {
        if (this.spaceKey.isDown && this.scene.time.now > this.nextBomb) {

            var bomb = this.bombs.get(this.x, this.y) as Bomb
                
            if (bomb) {
            //if bullet exists
                eventsCenter.emit('change-score', -10);

                this.addShootingEffect();

                bomb.reInitWithAngle(this.barrel.rotation);

                this.nextBomb = this.scene.time.now+1000;
            }
            
        }
        
    }

    private createNewBomb() {
        return new Bomb({
            scene: this.scene,
            rotation: this.barrel.rotation,
            x: this.x,
            y: this.y,
            texture: 'bomb',
            damage: 100
        });
    }

    private handleInput() {
        this.handleMove();
        this.handleShooting();
        this.handleBomb();
    }

    private handleMove() {
        if (this.cursors.up.isDown || this.moveKeyUp.isDown) {
            this.body.setVelocityY(-this.speed)
        } else if (this.cursors.down.isDown || this.moveKeyDown.isDown) {
            this.body.setVelocityY(this.speed)
        } else {
            this.body.setVelocityY(0);
        }

        if (this.cursors.left.isDown || this.moveKeyLeft.isDown) {
            this.body.setVelocityX(-this.speed)
        } else if (this.cursors.right.isDown || this.moveKeyRight.isDown) {
            this.body.setVelocityX(this.speed)
        } else {
            this.body.setVelocityX(0);
        }
    }

    private updateBarrel() {
        this.barrel.rotation = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            this.scene.input.activePointer.worldX,
            this.scene.input.activePointer.worldY,
        ) + Math.PI / 2
    }

    private handleShooting(): void {
        if (this.scene.input.activePointer.isDown && this.scene.time.now > this.nextShoot) {
            var bullet = this.bullets.get(this.x, this.y) as Bullet
                
            if (bullet) {
            //if bullet exists
                eventsCenter.emit('change-score', -1);

                this.shootSound.play({
                    volume: 0.3
                });

                this.addShootingEffect();
                bullet.reInitWithAngle(this.barrel.rotation);

                this.nextShoot = this.scene.time.now + this.shootingDelayTime;
            }
        }
    }

    private addShootingEffect() {
        this.scene.tweens.add({
            targets: this,
            props: { alpha: 0.8 },
            delay: 0,
            duration: 5,
            ease: 'Power1',
            easeParams: null,
            hold: 0,
            repeat: 0,
            repeatDelay: 0,
            yoyo: true,
            paused: false
        });
    }

    private updateLifebar(): void {
        if (this.isDead()) {
            this.lifeBar.destroy();
        }
        this.lifeBar.clear();
        this.lifeBar.fillStyle(0xe66a28, 1);
        this.lifeBar.fillRect(
            -this.tank.width / 2,
            this.tank.height / 2,
            this.tank.width * this.health,
            15
        );
        this.lifeBar.lineStyle(2, 0xffffff);
        this.lifeBar.strokeRect(-this.tank.width / 2, this.tank.height / 2, this.tank.width, 15);
        this.lifeBar.setDepth(2);
    }

    private createGotHitEffect(_x: number, _y: number) {
        this.setAlpha(0);

        this.scene.tweens.add({
            targets: this,
            props: {
                alpha: 1
            },
            duration: 150,
            repeat: false,
            onComplete: () => {
            }
        })

        var emitter = this.scene.add.particles('blue-spark').createEmitter({
            x: _x,
            y: _y,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            gravityY: 800,
        });
        this.scene.time.delayedCall(200, ()=>{
            emitter.stop();
        });
    }

    private setDead() {
        this.stopAllEffect();
        this.active = false;
        this.visible = false;
        eventsCenter.emit('player-dead');
    }

    private stopAllEffect() {
        this.fire?.stop()
        this.darkSmoke?.stop()
        this.whiteSmoke?.stop()
    }

    private createFireEffect() {
        if (this.fire) return;

        this.fire = this.scene.add.particles('fire').createEmitter({
            alpha: { start: 1, end: 0 },
            scale: { start: 0.5, end: 2.5 },
            tint: { start: 0xff945e, end: 0xff945e },
            speed: 20,
            // accelerationY: -300,
            angle: { min: -85, max: -95 },
            rotate: { min: -180, max: 180 },
            lifespan: { min: 1000, max: 1100 },
            blendMode: 'ADD',
            frequency: 110,
            x: 400,
            y: 300,
            follow: this
        });

    }

    private createSmokeEffect() {
        if (this.whiteSmoke) return;

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

    private stopSmokeEffect() {
        this.whiteSmoke.stop();
        this.darkSmoke.stop();
    }

    private updateState() {
        if (this.health > 0) {
            if (this.health <= 0.7) {
                this.createSmokeEffect();
            } 
            if (this.health <= 0.4) {
                this.stopSmokeEffect();
                this.createFireEffect();
            }
        } else {
            this.setDead();
        }
    }
}
