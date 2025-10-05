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
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const xDiff = Math.abs(dx);
        const yDiff = Math.abs(dy);

        // If adjacent to the player, deal damage
        if (xDiff + yDiff <= 16) {
            this.scene.game.events.emit(EVENTS.DAMAGE);
            return;
        }

        // Helper to try a move and return whether it actually moved
        const tryMove = async (dir: ORIENTATION): Promise<boolean> => {
            const ox = this.x, oy = this.y;
            await this.move(1, dir, this.enemyGroup);
            return this.x !== ox || this.y !== oy;
        };

        // Build a prioritized list of directions to try
        const primaryH = dx > 0 ? ORIENTATION.EAST : ORIENTATION.WEST;
        const secondaryH = dx > 0 ? ORIENTATION.WEST : ORIENTATION.EAST;
        const primaryV = dy > 0 ? ORIENTATION.SOUTH : ORIENTATION.NORTH;
        const secondaryV = dy > 0 ? ORIENTATION.NORTH : ORIENTATION.SOUTH;

        // Prefer axis with greater distance, then the other axis,
        // then perpendicular detours to help navigate around walls.
        let candidates: ORIENTATION[];
        if (xDiff > yDiff) {
            candidates = [primaryH, primaryV, secondaryV, secondaryH];
        } else {
            candidates = [primaryV, primaryH, secondaryH, secondaryV];
        }

        for (const dir of candidates) {
            if (await tryMove(dir)) return;
        }
    }

}