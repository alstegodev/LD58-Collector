import Sprite = Phaser.Physics.Arcade.Sprite;
import Body = Phaser.Physics.Arcade.Body;
import TweenBuilderConfig = Phaser.Types.Tweens.TweenBuilderConfig;
import {Scene} from "phaser";
import {ORIENTATION} from "../consts.ts";

export class Actor extends Sprite {

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

    public async setOrientation(orientation: ORIENTATION) {
        if (this.orientation != orientation) {
            let start = Math.PI / 2 * this.orientation
            let end = Math.PI / 2 * orientation
            if(this.orientation === 0 && orientation === 3) {
                start += Math.PI * 2
            } else if(this.orientation === 3 && orientation === 0) {
                end += Math.PI * 2
            }
            console.log(start, end)
            await this.tweensAsync({
                targets: this,
                duration: 200,
                rotation: {
                    from: start,
                    to: end
                },
                repeat: 0,
                yoyo: false
            })
        }
        this.orientation = orientation;
    }

    public async move(distance: number, direction: ORIENTATION = this.orientation, obstacles: Actor[] = []) {
        let newCoordinates: {x: number, y: number} = {x: this.x, y: this.y}

        switch (direction) {
            case ORIENTATION.NORTH:
                newCoordinates = {x: this.x, y: this.y - 16 * distance}
                break;
            case ORIENTATION.SOUTH:
                newCoordinates = {x: this.x, y: this.y + 16 * distance}
                break;
            case ORIENTATION.EAST:
                newCoordinates = {x: this.x + 16 * distance, y: this.y}
                break;
            case ORIENTATION.WEST:
                newCoordinates = {x: this.x - 16 * distance, y: this.y}
                break;
        }
        if(obstacles.length > 0) {
            if(obstacles.some(obstacle => obstacle.x === newCoordinates.x && obstacle.y === newCoordinates.y)) {
                return
            }
        }

        await this.tweensAsync({
            targets: this,
            y: newCoordinates.y,
            x: newCoordinates.x,
            duration: 200,
            repeat: 0,
            yoyo: false,
        })
    }

    protected getBody(): Body {
        return this.body as Body;
    }

    private tweensAsync = (config: TweenBuilderConfig): Promise<void> => {
        return new Promise(resolve => {
            this.scene.tweens.add({
                ...config,
                onComplete: () => {
                    resolve()
                }
            })
        })
    }

}