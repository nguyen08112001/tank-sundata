import { IImageConstructor } from "../../interfaces/image.interface";
import { Enemy } from "./Enemy";

export class HugeTank extends Enemy {
    constructor(aParams: IImageConstructor) {
        super(aParams);
        this.customConfig();
        this.customParentProperties();
    }

    private customParentProperties() {
        this.deadPoint = 200;
        this.damage /= 2;
    }

    private customConfig() {
        this.setTint(0x5a5a5a);
        this.barrel.setTint(0x5a5a5a);
        this.setScale(1.5);
        this.barrel.setScale(1.5);
        this.lifeBar.setScale(1.5);
    }

    gotDamage(_x: number, _y:number, _damage: number): void {
        super.gotDamage(_x, _y, _damage / 2 )
    }
}