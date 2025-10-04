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

    public async move(distance: number, direction: ORIENTATION = this.orientation) {
        switch (direction) {
            case ORIENTATION.NORTH:
                await this.tweensAsync({
                    targets: this,
                    y: this.y - 16 * distance,
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                })
                break;
            case ORIENTATION.SOUTH:
                await this.tweensAsync({
                    targets: this,
                    y: this.y + 16 * distance,
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                });
                break;
            case ORIENTATION.EAST:
                await this.tweensAsync({
                    targets: this,
                    x: this.x + 16 * distance,
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                });
                break;
            case ORIENTATION.WEST:
                await this.tweensAsync({
                    targets: this,
                    x: this.x - 16 * distance,
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