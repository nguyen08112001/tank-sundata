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
            Phaser.Input.Keyboard.KeyCodes.H
        );
        this.startKey.isDown = false;
    }

    create(): void {
        // this.add.image(this.sys.canvas.width / 2,this.sys.canvas.height / 2, 'game-over')

        this.add.image(this.sys.canvas.width / 2 -100,this.sys.canvas.height -200, 'back-button')
            .setScale(6)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop('GameScene')
                this.scene.stop('GameOverScene')
                this.scene.stop('MenuScene')
                this.scene.stop('PauseScene')
                this.scene.stop('VictoryScene')
                this.scene.start('MenuScene');
            })
            
        this.add.image(this.sys.canvas.width / 2 + 100,this.sys.canvas.height -200, 'play-button')
            .setScale(4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.restartGame()
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
            this.restartGame()
        }
    }

    restartGame() {
        this.scene.stop('GameScene')
        this.scene.stop('GameOverScene')
        this.scene.stop('MenuScene')
        this.scene.stop('PauseScene')
        this.scene.stop('VictoryScene')
        this.scene.start('MenuScene');
    }
}
