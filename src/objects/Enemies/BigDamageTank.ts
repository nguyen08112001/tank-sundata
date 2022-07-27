import { IImageConstructor } from "../../interfaces/image.interface";
import { Bullet } from "../Bullet";
import { Enemy } from "./Enemy";

export class BigDamageTank extends Enemy {
    constructor(aParams: IImageConstructor) {
        super(aParams);
        this.customConfig();
    }

    private customConfig() {
        this.damage = 0.2;
        this.barrel.setScale(2);
        this.tween = this.scene.tweens.add({
            targets: this,
            props: { y: this.y - 200 },
            delay: 0,
            duration: 1000,
            ease: 'Linear',
            easeParams: null,
            hold: 0,
            repeat: -1,
            repeatDelay: 0,
            yoyo: true
        });
    }
}