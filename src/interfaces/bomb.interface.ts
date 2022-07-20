export interface IBombConstructor {
    scene: Phaser.Scene;
    rotation: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    texture: string;
    frame?: string | number;
  }
  