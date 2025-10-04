import {Actor} from "./actor.ts";
import {ORIENTATION, TEXTURES} from "../consts.ts";

export class Player extends Actor {

    private keyW: Phaser.Input.Keyboard.Key;
    private keyA: Phaser.Input.Keyboard.Key;
    private keyS: Phaser.Input.Keyboard.Key;
    private keyD: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, TEXTURES.PLAYER);

        this.keyW = this.scene.input.keyboard!.addKey("W");
        this.keyA = this.scene.input.keyboard!.addKey("A");
        this.keyS = this.scene.input.keyboard!.addKey("S");
        this.keyD = this.scene.input.keyboard!.addKey("D");

        this.getBody().setSize(16, 16);
    }

    update(): void {
        this.getBody().setVelocity(0);
        if (this.keyW.isDown) {
            this.setOrientation(ORIENTATION.NORTH);
            this.moveForward()
        }
        if (this.keyA.isDown) {
            this.setOrientation(ORIENTATION.WEST);
            this.moveForward()
        }
        if (this.keyS.isDown) {
            this.setOrientation(ORIENTATION.SOUTH);
            this.moveForward()
        }
        if (this.keyD.isDown) {
            this.setOrientation(ORIENTATION.EAST);
            this.moveForward()
        }
    }

}