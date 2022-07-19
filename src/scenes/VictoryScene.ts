export class VictoryScene extends Phaser.Scene {
    private startKey: Phaser.Input.Keyboard.Key;
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];
    private bestScore = Number.parseInt(localStorage.getItem('best') as string, 10);
    score: number;
    constructor() {
        super({
            key: 'VictoryScene'
        });
    }

    init( props: { score?: number }): void {
        this.startKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.S
        );
        this.startKey.isDown = false;
        this.score = props.score
    }

    create(): void {    
        this.createTrunk()  
        this.time.addEvent({
            delay: 2500,                // ms
            callback: () => {
                this.addImage()
            },
            //args: [],
            callbackScope: this,
            loop: true
        });

    }

    update(): void {
        if (this.startKey.isDown) {
            this.scene.start('GameScene');
        }
    }

    private addImage() {
        let img = this.add.image(this.sys.canvas.width / 2,this.sys.canvas.height / 2, 'victory').setScale(2)
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
                this.scene.stop('GameScene')
                this.scene.stop('GameOverScene')
                this.scene.stop('MenuScene')
                this.scene.stop('PauseScene')
                this.scene.stop('VictoryScene')
                this.scene.start('GameScene');
            })

        this.bitmapTexts.push(
            this.add.bitmapText(
                this.sys.canvas.width / 2 - 180,
                this.sys.canvas.height - 100,
                'font',
                'RETURN  REPLAY',
                30
            ).setTintFill(0xffffff),

            this.add.bitmapText(
                this.sys.canvas.width / 2 - 180,
                this.sys.canvas.height /2 + 200,
                'font',
                'SCORE      ' + this.score + '\n\nBEST SCORE ' + this.bestScore,
                30
            ).setTintFill(0xffffff)
        );
        this.createFirework()

    }

    private createFirework() {
        var p0 = new Phaser.Math.Vector2(600, 300);
        var p1 = new Phaser.Math.Vector2(600, 0);
        var p2 = new Phaser.Math.Vector2(1000, 0);
        var p3 = new Phaser.Math.Vector2(1000, 300);

        var curve = new Phaser.Curves.CubicBezier(p0, p1, p2, p3);

        var max = 28;
        var points = [];
        var tangents = [];

        for (var c = 0; c <= max; c++)
        {
            var t = curve.getUtoTmapping(c / max, 0);

            points.push(curve.getPoint(t));
            tangents.push(curve.getTangent(t));
        }

        var tempVec = new Phaser.Math.Vector2();

        var spark0 = this.add.particles('red-spark');
        var spark1 = this.add.particles('blue-spark');

        for (var i = 0; i < points.length; i++)
        {
            var p = points[i];

            tempVec.copy(tangents[i]).normalizeRightHand().scale(-32).add(p);

            var angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(p, tempVec));

            var particles = (i % 2 === 0) ? spark0 : spark1;

            particles.createEmitter({
                x: tempVec.x,
                y: tempVec.y,
                angle: angle,
                speed: { min: -100, max: 500 },
                gravityY: 200,
                scale: { start: 0.4, end: 0.1 },
                lifespan: 800,
                blendMode: 'SCREEN'
            });
        }
    }

    private createTrunk() {
        var trunk = new Phaser.Geom.Rectangle(-130, -250, 1150, 860);
        var particles = this.add.particles('flares');
        particles.createEmitter({
            frame: 'blue',
            x: 360, y: 420,
            speed: 0,
            lifespan: 500,
            delay: 500,
            frequency: 0,
            quantity: 1,
            scale: 0.2,
            blendMode: 'ADD',
            emitZone: { type: 'edge', source: trunk, quantity: 48 }
        });
    }
}
