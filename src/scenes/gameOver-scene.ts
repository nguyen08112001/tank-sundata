export class GameOverScene extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];

    constructor() {
        super({
            key: 'GameOverScene'
        });
    }

    init(): void {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.startKey.isDown = false;
    }

    create(): void {
        this.cameras.main.setAlpha(0.5)

        this.add.image(this.sys.canvas.width / 2,this.sys.canvas.height / 2, 'game-over')

        this.add.image(this.sys.canvas.width / 2 -100,this.sys.canvas.height -200, 'back-button')
            .setScale(6)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MenuScene');
            })
            
        this.add.image(this.sys.canvas.width / 2 + 100,this.sys.canvas.height -200, 'play-button')
            .setScale(4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('GameScene');
            })

        this.bitmapTexts.push(
        this.add.bitmapText(
            this.sys.canvas.width / 2 - 150,
            this.sys.canvas.height - 100,
            'font',
            'RETURN              PLAY',
            30
        )
        );
    }

    update(): void {
        if (this.startKey.isDown) {
            this.scene.start('MenuScene');
        }
    }
}