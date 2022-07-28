import { IImageConstructor } from "../../interfaces/image.interface";
import { Bullet } from "../Bullet";
import { Enemy } from "./Enemy";

export class BigDamageTank extends Enemy {
    constructor(aParams: IImageConstructor) {
        super(aParams);

        this.customParentProperties();

        this.customConfig();
    }
    private customParentProperties() {
        this.deadPoint = 200;
        this.damage = 0.2;
    }

    private customConfig() {
        this.barrel.setScale(1.5);
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

        this.getBullets().children.iterate((bullet) => {
            var _bullet = bullet as Bullet
            _bullet.createFireEffect()
            _bullet.setTexture('shield-white'),
            _bullet.setDamage(this.damage)
            _bullet.setDisplaySize(100, 100)
            _bullet.body.setSize(500, 500)
        })

    }
}