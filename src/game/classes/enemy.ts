import {Actor} from "./actor.ts";
import {EVENTS, ORIENTATION, TEXTURES} from "../consts.ts";
import {Player} from "./player.ts";

export class Enemy extends Actor {

    private target: Player;
    private enemyGroup: Enemy[];

    constructor(scene: Phaser.Scene, x: number, y: number, player: Player, enemyGroup: Enemy[]) {
        super(scene, x, y, TEXTURES.ENEMY);

        this.target = player;
        this.enemyGroup = enemyGroup
        this.getBody().setSize(16, 16);
    }

    async update() {
        // this.getBody().setVelocity(0);
    }

    public async moveToTarget() {
        const xDiff = Math.abs(this.target.x - this.x);
        const yDiff = Math.abs(this.target.y - this.y);

        if(xDiff + yDiff <= 16) {
            console.log('EMIT DAMAGE')
            this.scene.game.events.emit(EVENTS.DAMAGE)
            return;
        }
        if(xDiff > yDiff) {
            if(this.target.x > this.x) {
                await this.move(1, ORIENTATION.EAST, this.enemyGroup);
            } else {
                await this.move(1, ORIENTATION.WEST, this.enemyGroup);
            }
        } else {
            if(this.target.y > this.y) {
                await this.move(1, ORIENTATION.SOUTH, this.enemyGroup);
            } else {
                await this.move(1, ORIENTATION.NORTH, this.enemyGroup);
            }
        }
    }

}