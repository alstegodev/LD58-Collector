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
        let stepX = 0, stepY = 0;
        switch (direction) {
            case ORIENTATION.NORTH:
                stepY = -16; break;
            case ORIENTATION.SOUTH:
                stepY = 16; break;
            case ORIENTATION.EAST:
                stepX = 16; break;
            case ORIENTATION.WEST:
                stepX = -16; break;
        }

        const wallsLayer = (this.scene as any).wallsLayer as Phaser.Tilemaps.TilemapLayer | undefined;

        let allowedSteps = 0;
        let testX = this.x;
        let testY = this.y;
        for (let i = 0; i < distance; i++) {
            const nx = testX + stepX;
            const ny = testY + stepY;

            if (wallsLayer) {
                const tile = wallsLayer.getTileAtWorldXY(nx, ny);
                if (tile && ((tile.properties && (tile.properties as any).obstacle === true) || (tile as any).collides === true)) {
                    break;
                }
            }

            if (obstacles.length > 0) {
                const blocked = obstacles.some(ob => ob !== this && ob.x === nx && ob.y === ny);
                if (blocked) {
                    break;
                }
            }

            allowedSteps++;
            testX = nx;
            testY = ny;
        }

        if (allowedSteps === 0) return;

        await this.tweensAsync({
            targets: this,
            x: testX,
            y: testY,
            duration: 200 * allowedSteps,
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