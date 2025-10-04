import {Scene} from "phaser";
import {TEXTURES} from "../../consts.ts";

export class LoadingScene extends Scene {
    constructor() {
        super('loading-scene');
    }

    preload(): void {

        this.load.image(TEXTURES.COMMAND_BOARD, 'assets/commandBoard.png')
        this.load.image(TEXTURES.PLAYER, 'assets/player.png')

        this.load.spritesheet(TEXTURES.CARDS, 'assets/cards.png', {
            frameWidth: 96,
            frameHeight: 32,
        })

        this.load.spritesheet(TEXTURES.BIG_RED_BUTTON, 'assets/bigRedButton-anim.png', {
            frameWidth: 66,
            frameHeight: 44,
        })

        this.load.image({
            key: 'tiles',
            url: 'assets/grass2.png'
        })
        this.load.tilemapTiledJSON('dungeon', 'assets/Tilemaps/grass.json')
        this.load.spritesheet('tiles_spr', 'assets/grass2.png', {
            frameWidth: 16,
            frameHeight: 16
        })
    }

    create(): void {
        this.scene.start('level-1-scene');
        this.scene.start('ui-scene');
    }
}