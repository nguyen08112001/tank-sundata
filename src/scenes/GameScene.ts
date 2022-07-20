import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';
import { Obstacle } from '../objects/obstacles/Obstacle';
import { Bullet } from '../objects/Bullet';
import { Shield } from '../objects/Shield';
import { Barrel } from '../objects/obstacles/Barrel';

export class GameScene extends Phaser.Scene {
    private map: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private layer: Phaser.Tilemaps.TilemapLayer;

    public player: Player;
    public enemies: Phaser.GameObjects.Group;
    private obstacles: Phaser.GameObjects.Group;

    private target: Phaser.Math.Vector2;
    minimap: Phaser.Cameras.Scene2D.Camera;
    private pauseKey: Phaser.Input.Keyboard.Key;
    scoreText: Phaser.GameObjects.BitmapText;
    score: number;
    private best: number = Number.parseInt(localStorage.getItem('best') as string, 10) || 0;
    barrel: Barrel;
    barrels: Phaser.GameObjects.Group;

    
    constructor() {
        super({
        key: 'GameScene'
        });
    }

    preload(): void {
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.time.timeScale = 1
            this.tweens.timeScale = 1
        })
    }

    init() {
        this.scene.run('particle-effects')
    }

    create(): void {

        this.cameras.main.fadeIn()
        // create tilemap from tiled JSON
        this.map = this.make.tilemap({ key: 'levelMap' });

        this.tileset = this.map.addTilesetImage('tiles');
        this.layer = this.map.createLayer('tileLayer', this.tileset, 0, 0);
        this.layer.setCollisionByProperty({ collide: true });

        this.obstacles = this.add.group({
            /*classType: Obstacle,*/
            runChildUpdate: true
        });

        this.enemies = this.add.group({
            /*classType: Enemy*/
        });
        
        this.barrels = this.add.group({
            /*classType: Enemy*/
            runChildUpdate: true
        });
        this.convertObjects();

        // collider layer and obstacles
        this.physics.add.collider(this.player, this.layer);
        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.player.getBombs(), this.layer);

        // collider for bullets
        this.physics.add.collider(
        this.player.getBullets(),
        this.layer,
        this.bulletHitLayer,
        null,
        this
        );

        this.physics.add.collider(
        this.player.getBullets(),
        this.obstacles,
        this.bulletHitObstacles,
        null,
        this
        );

        this.enemies.children.each((enemy: Enemy) => {
        this.physics.add.overlap(
            this.player.getBullets(),
            enemy,
            this.playerBulletHitEnemy,
            null,
            this
        );
        this.physics.add.overlap(
            enemy.getBullets(),
            this.player,
            this.enemyBulletHitPlayer,
            null
        );

        this.physics.add.collider(
            enemy.getBullets(),
            this.obstacles,
            this.bulletHitObstacles,
            null
        );
        this.physics.add.collider(
            enemy.getBullets(),
            this.layer,
            this.bulletHitLayer,
            null
        );

        this.physics.add.collider(this.barrels, enemy.getBullets(), (_barrel: Barrel, _bullet: Bullet) => {
            _bullet.kill()
            _barrel.updateHealth(_bullet.x, _bullet.y)
        }, null);


        }, this);


        this.physics.add.collider(this.barrels, this.player.getBullets(), (_barrel: Barrel, _bullet: Bullet) => {
            _bullet.kill()
            _barrel.updateHealth(_bullet.x, _bullet.y)
        });
        
        

        this.cameras.main.startFollow(this.player);

        //mini map
        this.minimap = this.cameras.add(0, 10, 400, 400).setZoom(0.2).setName('mini').setAlpha(0.8);
        this.minimap.setBackgroundColor(0x002244);
        this.minimap.scrollX = 1600;
        this.minimap.scrollY = 300;

        this.input.setDefaultCursor('url(./assets/blue.cur), pointer')

        this.pauseKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.P
        );

        var settingButton = this.add.image(this.sys.canvas.width -60, 60, 'settings-button')
            .setScale(4)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.pauseGame()
            })
            .on('pointerover', () => {
                settingButton.setScale(6)
            })
            .on ('pointerout', () => {
                settingButton.setScale(4)
            })
            .setScrollFactor(0,0)

        //sound
        this.sound.stopAll()
        // this.sound.add('music').play()
        this.setSound()
        const level = this.scene.get('PauseScene');
        level.events.on('setSound', this.setSound, this)

        //add score text
        this.scoreText =  this.add.bitmapText(
            this.sys.canvas.width / 4 + 50,
            50,
            'font',
            'SCORE: 0',
            30
        )
        this.scoreText.setScrollFactor(0,0)
        this.scoreText.setTintFill(0xffffff)

        this.minimap.ignore(this.scoreText)
        this.score = 0;
    }

    private setSound() {
        if (this.registry.get('hasSound')) {
            this.sound.volume = 1
        } else {
            this.sound.volume = 0
            
        }
    }

    update(): void {
        this.updateScore()

        if (this.pauseKey.isDown) {
            this.pauseGame()
        }

        this.player.update();

        this.enemies.children.each((enemy: Enemy) => {
        enemy.update();
        if (this.player.active && enemy.active) {
            var angle = Phaser.Math.Angle.Between(
            enemy.body.x,
            enemy.body.y,
            this.player.body.x,
            this.player.body.y
            );

            enemy.getBarrel().angle =
            (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;
        }
        }, this);

        this.minimap.scrollX = Phaser.Math.Clamp(this.player.x - 200, 800, 2000);
        this.minimap.scrollY = Phaser.Math.Clamp(this.player.y - 200, 800, 1200);

    }
    updateScore() {
        this.scoreText.text = 'SCORE: ' + this.score ;
        this.best = Math.max(this.score, this.best)
        localStorage.setItem('best', this.best + '')
    }

    private convertObjects(): void {
        // find the object layer in the tilemap named 'objects'
        const objects = this.map.getObjectLayer('objects').objects as any[];

        objects.forEach((object) => {
        if (object.type === 'player') {
            this.player = new Player({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'tankBlue'
            });
        } else if (object.type === 'enemy') {
            let enemy = new Enemy({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'tankRed'
            });

            this.enemies.add(enemy);
        } else if (object.type === 'barrelRedTop' 
            || object.type === 'barrelGreySideRust'
            || object.type === 'barrelGreyTop'
        ) {
            var barrel = new Barrel({
                    scene: this,
                    x: object.x,
                    y: object.y - 40,
                    texture: object.type
                });
            this.barrels.add(barrel);
        }
        else if (object.type === 'shield') {
            let shield = new Shield({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'shield'
            });

            this.physics.add.overlap(this.player, shield, () => {
                this.player.shield = true;
                this.time.addEvent({
                    delay: 5000,
                    callback: () => {
                        this.player.shield = false
                    }
                }) 
                shield.destroy()
            })
        } else {
            let obstacle = new Obstacle({
            scene: this,
            x: object.x,
            y: object.y - 40,
            texture: object.type
            });

            this.obstacles.add(obstacle);
        }
        });
    }

    private bulletHitLayer(bullet: Bullet): void {
        bullet.kill();
    }

    private bulletHitObstacles(bullet: Bullet, obstacle: Obstacle): void {
        bullet.kill();
    }

    private enemyBulletHitPlayer(bullet: Bullet, player: Player): void {
        bullet.kill();
        player.updateHealth(bullet.x, bullet.y, 0.05);
    }

    private playerBulletHitEnemy(bullet: Bullet, enemy: Enemy): void {
        bullet.kill();
        enemy.updateHealth(bullet.x, bullet.y);
    }

    private pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

}
