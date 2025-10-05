import {Scene} from "phaser";
import {TEXTURES} from "../../consts.ts";

export class LoadingScene extends Scene {
    constructor() {
        super('loading-scene');
    }

    preload(): void {

        this.load.image(TEXTURES.COMMAND_BOARD, 'assets/commandBoard.png')
        this.load.image(TEXTURES.PLAYER, 'assets/player.png')
        this.load.image(TEXTURES.ENEMY, 'assets/enemy.png')
        this.load.image(TEXTURES.ATTACK, 'assets/attack.png')
        this.load.image(TEXTURES.SKIP, 'assets/skip.png')
        this.load.image(TEXTURES.CLICKTOSTART, 'assets/clickToStart.png')
        this.load.image(TEXTURES.TITLE, 'assets/title.png')
        this.load.image(TEXTURES.TUTORIAL, 'assets/tutorial.png')
        this.load.image(TEXTURES.RESET, 'assets/reset.png')
        this.load.image(TEXTURES.HIDE, 'assets/hide.png')

        this.load.spritesheet(TEXTURES.CHOOSE, 'assets/direction-arrows.png', {
            frameWidth: 40,
            frameHeight: 40,
        })

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
            url: 'assets/tileset.png'
        })
        this.load.tilemapTiledJSON('dungeon', 'assets/Tilemaps/map.json')
        this.load.spritesheet('tiles_spr', 'assets/tileset.png', {
            frameWidth: 16,
            frameHeight: 16
        })
    }

    create(): void {
        this.scene.start('title');
    }
}