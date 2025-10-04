import Sprite = Phaser.Physics.Arcade.Sprite;
import Body = Phaser.Physics.Arcade.Body;
import {Scene} from "phaser";
import {ORIENTATION} from "../consts.ts";
import Tween = Phaser.Tweens.Tween;


export class Actor extends Sprite {


    protected tween: Tween | null = null;
    protected orientation = ORIENTATION.NORTH;

    constructor(
        scene: Scene,
        x: number, y: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.getBody().setCollideWorldBounds(true);
    }

    public setOrientation(orientation: ORIENTATION): void {
        if (this.tween && this.tween.isPlaying()) {
            return;
        }

        this.orientation = orientation;
        this.setRotation(Math.PI / 2 * orientation)
    }

    public moveForward(): void {
        if (this.tween && this.tween.isPlaying()) {
            return;
        }

        switch (this.orientation) {
            case ORIENTATION.NORTH:
                this.tween = this.scene.tweens.add({
                    targets: this,
                    y: this.y - 16,
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                })
                break;
            case ORIENTATION.SOUTH:
                this.tween = this.scene.tweens.add({
                    targets: this,
                    y: this.y + 16,
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                });
                break;
            case ORIENTATION.EAST:
                this.tween = this.scene.tweens.add({
                    targets: this,
                    x: this.x + 16,
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                });
                break;
            case ORIENTATION.WEST:
                this.tween = this.scene.tweens.add({
                    targets: this,
                    x: this.x - 16,
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                });
                break;
        }
    }

    protected getBody(): Body {
        return this.body as Body;
    }

}