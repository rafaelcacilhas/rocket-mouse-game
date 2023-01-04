import Phaser from "phaser";
import AnimationKeys from "../consts/AnimationKeys";
import SceneKeys from "../consts/SceneKeys";
import TextureKeys from "../consts/TextureKeys";

enum MouseState {
    Running,
    Killed,
    Dead
}

export default class RocketMouse extends Phaser.GameObjects.Container{

    private mouse!: Phaser.GameObjects.Sprite
    private flames!: Phaser.GameObjects.Image
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys
    private mouseState = MouseState.Running

    constructor(scene: Phaser.Scene, x: number, y:number){
        super(scene,x,y)

        this.mouse = scene.add.sprite(0,0,TextureKeys.RocketMouse)
        .setOrigin(0.5,1)
        .play(AnimationKeys.RocketMouseRun)

        this.flames = scene.add.sprite(-63,-15,TextureKeys.RocketMouse)
        .play(AnimationKeys.RocketFlamesOn)

        this.add(this.flames)
        this.add(this.mouse)
        scene.physics.add.existing(this)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setSize(this.mouse.width, this.mouse.height)
        body.setOffset(-this.mouse.width/2,-this.mouse.height)

        this.enableJetpack(false)
        this.cursors = scene.input.keyboard.createCursorKeys()
    }

    preUpdate(){
        const body = this.body as Phaser.Physics.Arcade.Body

        switch( this.mouseState ){
            case MouseState.Running:
                {
                    if(this.cursors.space?.isDown){
                        this.enableJetpack(true)
                        body.setAccelerationY(-600)
            
                        this.mouse.play(AnimationKeys.RocketMouseFly, true)
                    }
                    else {
                        this.enableJetpack(false)
                        body.setAccelerationY(0)
            
                        if(body.velocity.y > 0){
                            this.mouse.play(AnimationKeys.RocketMouseFall,true)
                        }
                        else if(body.velocity.y < 0){
                            this.mouse.play(AnimationKeys.RocketMouseFly,true)
                        }
                        else {
                            this.mouse.play(AnimationKeys.RocketMouseRun,true)
                        }
                    }
                    break;
                }
            case MouseState.Killed: 
                {
                    body.velocity.x *= 0.985
                    if(body.velocity.x <= 5){
                        this.mouseState = MouseState.Dead
                    }
                    break;
                }
            case MouseState.Dead:
                {
                    body.setVelocity(0,0)
                    this.scene.scene.run(SceneKeys.GameOver)
                    break;
                }
        }


    }

    enableJetpack(enabled:boolean){
        this.flames.setVisible(enabled)
    }

    kill(){

        if(this.mouseState !== MouseState.Running){
            return
        }

        this.mouseState = MouseState.Killed
        this.mouse.play(AnimationKeys.RocketMouseDead)

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setAccelerationY(0)
        body.setVelocity(1000,0)
        this.enableJetpack(false)
    }

    
}