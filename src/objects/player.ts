import { Bullet } from './bullet';
import { IImageConstructor } from '../interfaces/image.interface';

export class Player extends Phaser.GameObjects.Container {
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

    // input
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private moveKeyLeft: Phaser.Input.Keyboard.Key;
    private moveKeyRight: Phaser.Input.Keyboard.Key;
    private moveKeyUp: Phaser.Input.Keyboard.Key;
    private moveKeyDown: Phaser.Input.Keyboard.Key;
    private spaceKey: Phaser.Input.Keyboard.Key;
    private shootSound: Phaser.Sound.BaseSound;
    hitSound: Phaser.Sound.BaseSound;
    _shield: Phaser.GameObjects.Sprite;
    tank: Phaser.GameObjects.Image;
    private hasShield: boolean;

    public getBullets(): Phaser.GameObjects.Group {
        return this.bullets;
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y);

        this.initImage(aParams.texture);

        this.scene.add.existing(this);
    }

    private initImage(texture: string) {
        //tank
        this.tank = this.scene.add.image(0, 0, texture)
        this.tank.setOrigin(0.5, 0.5);
        this.tank.setDepth(0);
        this.tank.angle = 180;
        this.add(this.tank)

        // variables
        this.health = 1;
        this.lastShoot = 0;
        this.speed = 500;

        // barrel
        this.barrel = this.scene.add.image(0, 0, 'barrelBlue');
        this.barrel.setOrigin(0.5, 1);
        this.barrel.setDepth(1);
        this.barrel.angle = 180;
        this.add(this.barrel)

        //sound
        this.shootSound = this.scene.sound.add('shoot');
        this.hitSound = this.scene.sound.add('hit')

        //lifebar
        this.lifeBar = this.scene.add.graphics();
        this.add(this.lifeBar)
        this.redrawLifebar();

        // game objects
        this.bullets = this.scene.add.group({
            /*classType: Bullet,*/
            active: true,
            maxSize: 10,
            runChildUpdate: true
        });

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

        // physics
        this.scene.physics.world.enable(this);
        this.body.setOffset(-30, -30)

        //shield
        this._shield = this.scene.add.sprite(0, 0, 'shield')
                .setOrigin(0.5, 0.5)
                .setScale(0.3)
                .setDepth(1)
        this.add(this._shield)
        this.shield = true

    }

    update(): void {
        if (this.active) {
            this.handleInput();
            this.handleShooting();
        } else {
            this.barrel.destroy();
            this.lifeBar.destroy();
            this.tank.destroy();
            this.destroy();
        }
    }

    private handleInput() {
        // move tank forward
        // small corrections with (- MATH.PI / 2) to align tank correctly
        if (this.cursors.up.isDown || this.moveKeyUp.isDown) {
        // this.scene.physics.velocityFromRotation(
        //   this.rotation - Math.PI / 2,
        //   this.speed,
        //   this.body.velocity
        // );
        this.body.setVelocityY(-this.speed)
        } else if (this.cursors.down.isDown || this.moveKeyDown.isDown) {
        // this.scene.physics.velocityFromRotation(
        //   this.rotation - Math.PI / 2,
        //   -this.speed,
        //   this.body.velocity
        // );
        this.body.setVelocityY(this.speed)
        } else {
        this.body.setVelocityY(0);
        }

        // rotate tank
        if (this.cursors.left.isDown || this.moveKeyLeft.isDown) {
        // this.rotation -= 0.02;
        this.body.setVelocityX(-this.speed)
        } else if (this.cursors.right.isDown || this.moveKeyRight.isDown) {
        // this.rotation += 0.02;
        this.body.setVelocityX(this.speed)
        } else {
        this.body.setVelocityX(0);
        }

        // rotate barrel
        this.barrel.rotation = Phaser.Math.Angle.Between(
        this.body.x,
        this.body.y,
        this.scene.input.activePointer.worldX,
        this.scene.input.activePointer.worldY,
        ) + Math.PI / 2
    }

    private handleShooting(): void {
        if (this.scene.input.activePointer.isDown && this.scene.time.now > this.lastShoot) {
        // if (this.shootingKey.isDown && this.scene.time.now > this.lastShoot) {
        // this.scene.cameras.main.shake(20, 0.005);
        this.shootSound.play({
            volume: 0.3
        })
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

        if (this.bullets.getLength() < 10) {
            this.bullets.add(
            new Bullet({
                scene: this.scene,
                rotation: this.barrel.rotation,
                x: this.x,
                y: this.y,
                texture: 'bulletBlue'
            })
            );

            this.lastShoot = this.scene.time.now + 80;
        }
        }
    }

    private redrawLifebar(): void {
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

    public updateHealth(_x: number, _y: number): void {
        this.shield = false
        this.hitSound.play()
        this.scene.cameras.main.shake(20, 0.005);

        if (this.health > 0) { 
        // return;
        this.health -= 0.0005;
        this.redrawLifebar();
        } else {
            this.health = 0;
            this.active = false;
            this.scene.scene.start('GameOverScene');
    
        }
        this.setAlpha(0)
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
            //active: false,
            lifespan: 200,
            gravityY: 800,
        });
        this.scene.time.delayedCall(200, ()=>{
            emitter.stop();
        });
        // var particles = this.scene.add.particles('flares')
        // .createEmitter({
        //     frame: [ 'blue' ],
        //     x: _x,
        //     y: _y,
        //     speed: 300,
        //     gravityY: 400,
        //     lifespan: 200,
        //     scale: 0.4,
        //     blendMode: 'ADD'
        // });
        // this.scene.time.delayedCall(200, ()=>{
        //     particles.stop();
        // });
    }

    set shield (shield: boolean) {
        this._shield.setVisible(shield);
        this.hasShield = shield;
    }

    get shield () {
        return this.hasShield;
    }
}
