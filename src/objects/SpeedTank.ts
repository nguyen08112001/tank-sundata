import { IImageConstructor } from "../interfaces/image.interface";
import { Enemy } from "./Enemy";

export class SpeedTank extends Enemy {
    constructor(aParams: IImageConstructor) {
        super(aParams);
        this.damage = 1;
        this.barrel.setScale(2)
    }
}