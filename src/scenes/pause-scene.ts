import { Tilemaps } from "phaser";

export class PauseScene extends Phaser.Scene {
    private resumeKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];

    constructor() {
        super({
            key: 'PauseScene'
        });
    }

    init(): void {
        this.resumeKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.P
        );
        this.resumeKey.isDown = false;
    }

    create(): void {
        // this.cameras.main.setBackgroundColor(0x000000);  
        
        this.add.image(this.sys.canvas.width / 2,this.sys.canvas.height / 2, 'pause')

        var closeButton = this.add.image(this.sys.canvas.width - 300, 230, 'close-button')
            .setScale(4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.resume('GameScene');
            })
            .on('pointerover', () => {
                closeButton.setScale(6)
            })
            .on ('pointerout', () => {
                closeButton.setScale(4)
            })

        var playButton = this.add.image(this.sys.canvas.width / 2 - 100,this.sys.canvas.height -200, 'play-button')
            .setScale(4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop()
                this.scene.resume('GameScene');
            })
            .on('pointerover', () => {
                playButton.setScale(6)
            })
            .on ('pointerout', () => {
                playButton.setScale(4)
            })
        
        var volumeButton = this.add.image(this.sys.canvas.width / 2 ,this.sys.canvas.height -200, 'volume-button')
            .setScale(4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.registry.get('hasSound')) 
                {
                    volumeButton.setTint(0x808080)
                    this.registry.set('hasSound', false)
                    this.events.emit('setSound');
                }
                else {
                    this.registry.set('hasSound', true)
                    this.events.emit('setSound');
                    volumeButton.clearTint()
                }   
            })
            .on('pointerover', () => {
                volumeButton.setScale(6)
            })
            .on ('pointerout', () => {
                volumeButton.setScale(4)
            })
        if (!this.registry.get('hasSound')) {
            volumeButton.setTint(0x808080)
        }
            
        var restartButton =  this.add.image(this.sys.canvas.width / 2 +100, this.sys.canvas.height -200, 'restart-button')
            .setScale(4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop('GameScene')
                this.scene.stop('GameOverScene')
                this.scene.stop('MenuScene')
                this.scene.stop('PauseScene')
                this.scene.stop('VictoryScene')
                this.scene.start('GameScene');
            })
            .on('pointerover', () => {
                restartButton.setScale(6)
            })
            .on ('pointerout', () => {
                restartButton.setScale(4)
            })

        this.bitmapTexts.push(
            this.add.bitmapText(
                this.sys.canvas.width / 2 - 160,
                100,
                'font',
                'PAUSED',
                100
            )
        );
    }

    update(): void {
        if (this.resumeKey.isDown) {
            this.scene.stop()
            this.scene.resume('GameScene');
        }
    }
}
