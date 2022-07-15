import { IImageConstructor } from '../interfaces/image.interface';

export class Shield extends Phaser.GameObjects.Image {
  body: Phaser.Physics.Arcade.Body;

  constructor(aParams: IImageConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    this.initImage();
    this.scene.add.existing(this);
  }

  private initImage() {
    // image
    this.setScale(0.5)

    // physics
    this.scene.physics.world.enable(this);
  }

  update(): void {
  }

}
