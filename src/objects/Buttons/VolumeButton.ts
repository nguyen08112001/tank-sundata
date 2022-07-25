import { IImageConstructor } from '../../interfaces/image.interface';
import { Button } from './Button';

export class VolumeButton extends Button {
    body: Phaser.Physics.Arcade.Body;

    constructor(aParams: IImageConstructor) {
        super(aParams);
        if (!this.scene.registry.get('hasSound')) {
            this.setTint(0x808080)
        }
    }

    create() {
        
    }

    public handlePointerDown() {
        console.log(this.scene.registry.get('hasSound'))
        if (this.scene.registry.get('hasSound')) 
        {
            this.setTint(0x808080)
            this.scene.registry.set('hasSound', false)
            this.scene.events.emit('setSound');
        }
        else {
            this.scene.registry.set('hasSound', true)
            this.scene.events.emit('setSound');
            this.clearTint()
        }   
    }

    update(): void {
    }

}
