import Phaser from "phaser";
import SceneKeys from "../consts/SceneKeys";
import TextureKeys from "../consts/TextureKeys";
import LaserObstacle from "../game/LaserObstacle";

import RocketMouse from "../game/RocketMouse";

export default class Game extends Phaser.Scene {

    constructor(){
        super(SceneKeys.Game)
    }

    private background!: Phaser.GameObjects.TileSprite
    private mouseHole!: Phaser.GameObjects.Image
    private window1!: Phaser.GameObjects.Image
    private window2!: Phaser.GameObjects.Image
    private bookcase1!: Phaser.GameObjects.Image
    private bookcase2!: Phaser.GameObjects.Image

    private laserObstacle!: LaserObstacle

    private windows: Phaser.GameObjects.Image[] = []
    private bookcases: Phaser.GameObjects.Image[] = []

    private coins!: Phaser.Physics.Arcade.StaticGroup

    create(){
        const width = this.scale.width;
        const height = this.scale.height;

        this.background = this.add.tileSprite(0,0,width,height,TextureKeys.Background)
        .setOrigin(0,0)
        .setScrollFactor(0,0)

        this.mouseHole = this.add.image(
            Phaser.Math.Between(900,1500),
            501,
            TextureKeys.MouseHole
        )

        this.window1 = this.add.image(
            Phaser.Math.Between(900,1300),
            200,
            TextureKeys.Window1
        )
        this.window2 = this.add.image(
            Phaser.Math.Between(1600,2000),
            200,
            TextureKeys.Window2
        )
        this.windows = [this.window1, this.window2]

        this.bookcase1 = this.add.image(
            Phaser.Math.Between(2200,2700),
            580,
            TextureKeys.Bookcase1
        ).setOrigin(0.5,1)
        this.bookcase2 = this.add.image(
            Phaser.Math.Between(2900,3400),
            580,
            TextureKeys.Bookcase2
        ).setOrigin(0.5,1)
        this.bookcases = [this.bookcase1, this.bookcase2]

        this.laserObstacle = new LaserObstacle(this, 900,100)
        this.add.existing(this.laserObstacle)

        this.coins = this.physics.add.staticGroup()
        this.spawnCoins()

        const mouse = new RocketMouse(this, width*0.5, height -30)
        this.add.existing(mouse)

        const body = mouse.body as Phaser.Physics.Arcade.Body
        body.setCollideWorldBounds(true)

        this.physics.world.setBounds(
            0,0,    //x,y
            Number.MAX_SAFE_INTEGER, height -30 //width, height
        )

        body.setVelocityX(200)
        this.cameras.main.startFollow(mouse)
        this.cameras.main.setBounds(
            0,0,    //x,y
            Number.MAX_SAFE_INTEGER, height //width, height
        )

        this.physics.add.overlap(
            this.laserObstacle,
            mouse,
            this.handleOverlapLaser,
            undefined,
            this
        )
    }
    spawnCoins() {

        this.coins.children.each(child => {
            const coin = child as Phaser.Physics.Arcade.Sprite
            this.coins.killAndHide(coin)
            coin.body.enable = false
        })

        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        let x = rightEdge + 100

        const numCoins = Phaser.Math.Between(1,20)
        for(let i = 0; i < numCoins; i++){
            const coin = this.coins.get(
                x,
                Phaser.Math.Between(100, this.scale.height - 100),
                TextureKeys.Coin
            ) as Phaser.Physics.Arcade.Sprite

            coin.setVisible(true)
            coin.setActive(true)

            const body = coin.body as Phaser.Physics.Arcade.StaticBody
            body.setCircle(body.width *0.5)
            body.enable = true

            x += coin.width * 1.5
        }
    }

    handleOverlapLaser(_laserObstacle: Phaser.GameObjects.GameObject, mouse: any) {  // how do I fix this any?
        mouse.kill()
    }

    update(){
        this.background.setTilePosition(this.cameras.main.scrollX)
        this.wrapMouseHole()
        this.wrapWindows()
        this.wrapBookcases()
        this.wrapLasers()
    }

    private wrapMouseHole(){
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        if(this.mouseHole.x + this.mouseHole.width < scrollX){
            this.mouseHole.x = Phaser.Math.Between(
                rightEdge + 100,
                rightEdge + 1000
            )
        }
    }

    private wrapWindows(){
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        if(this.window1.x + 2*this.window1.width < scrollX){
            this.window1.x = Phaser.Math.Between(
                rightEdge + 2*this.window1.width,
                rightEdge + 2*this.window1.width + 800
            )
            const overlap = this.bookcases.find((item) => {
                return Math.abs(this.window1.x - item.x) <= this.window1.width
            })
            this.window1.visible = !overlap
        }

        if(this.window2.x + 2*this.window2.width < scrollX){
            this.window2.x = Phaser.Math.Between(
                this.window1.x + 2*this.window2.width,
                this.window1.x + 2*this.window2.width + 800
            )
            const overlap = this.bookcases.find((item) => {
                return Math.abs(this.window2.x - item.x) <= this.window2.width
            })
            this.window2.visible = !overlap
        }
    }

    private wrapBookcases(){
        const scrollX = this.cameras.main.scrollX;
        const rightEdge = scrollX + this.scale.width;

        if(this.bookcase1.x + 2*this.bookcase1.width < scrollX){
            this.bookcase1.x = Phaser.Math.Between(
                rightEdge + 2*this.bookcase1.width,
                rightEdge + 2*this.bookcase1.width + 800
            )
            const overlap = this.windows.find((item) => {
                return Math.abs(this.bookcase1.x - item.x) <= this.bookcase1.width
            })
            this.bookcase1.visible = !overlap
            
        }

        if(this.bookcase2.x + 2*this.bookcase2.width < scrollX){
            this.bookcase2.x = Phaser.Math.Between(
                this.bookcase1.x + 2*this.bookcase2.width,
                this.bookcase1.x + 2*this.bookcase2.width + 800
            )
            const overlap = this.windows.find((item) => {
                return Math.abs(this.bookcase2.x - item.x) <= this.bookcase2.width
            })
            this.bookcase2.visible = !overlap
        }
    }

    private wrapLasers(){
        const scrollX = this.cameras.main.scrollX
        const rightEdge = scrollX + this.scale.width

        const body = this.laserObstacle.body as Phaser.Physics.Arcade.Body
        const width = this.laserObstacle.width
        
        if(this.laserObstacle.x + width < scrollX){
            this.laserObstacle.x = Phaser.Math.Between(
                rightEdge + width,
                rightEdge + width + 1000
            )
            this.laserObstacle.y = Phaser.Math.Between(0,300)

            body.position.x = this.laserObstacle.x + body.offset.x
            body.position.y = this.laserObstacle.y
        }

    }

}