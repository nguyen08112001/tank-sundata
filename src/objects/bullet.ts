import { IBulletConstructor } from '../interfaces/bullet.interface';

export class Bullet extends Phaser.GameObjects.Image {
  body: Phaser.Physics.Arcade.Body;

  private bulletSpeed: number;
  fire: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(aParams: IBulletConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture);

    this.rotation = aParams.rotation;
    this.initImage();
    this.scene.add.existing(this);
  }

  private initImage(): void {
    // variables
    this.bulletSpeed = 1000;

    // image
    this.setOrigin(0.5, 0.5);
    this.setDepth(2);

    // physics
    this.scene.physics.world.enable(this);
    this.scene.physics.velocityFromRotation(
      this.rotation - Math.PI / 2,
      this.bulletSpeed,
      this.body.velocity
    );

    // var particles = this.scene.add.particles('flares');

    // this.fire = particles.createEmitter({
    //     frame: 'yellow',
    //     radial: false,
    //     lifespan: 100,
    //     // speedX: { min: 200, max: 400 }, 
    //     quantity: 4,
    //     // gravityY: -50,
    //     scale: { start: 0.6, end: 0, ease: 'Power3' },
    //     blendMode: 'ADD',
    //     follow: this
    // });


  }

  update(): void {}

  kill() {
    this.fire?.stop()
    this.destroy()
  }
}
