import {Scene, Tilemaps} from "phaser";
import {Player} from "../../classes/player.ts";

export class Level1 extends Scene {

    private map!: Tilemaps.Tilemap;
    private tileSet!: Tilemaps.Tileset;
    private grassLayer!: Tilemaps.TilemapLayer;

    private player!: Phaser.GameObjects.Image;


    constructor() {
        super('level-1-scene');
    }

    create(): void {

        this.initMap();
        this.initPlayer();

        this.initCamera();
    }

    update(): void {
        this.player.update();
    }

    private initMap(): void {
        this.map = this.make.tilemap({
            key: 'dungeon',
            tileWidth: 16,
            tileHeight: 16
        })

        this.tileSet = this.map.addTilesetImage('Grass', 'tiles')!;
        this.grassLayer = this.map.createLayer('Grass', this.tileSet, 0, 0)!;

        this.physics.world.setBounds(0, 0, 1600, 1600)
    }

    private initPlayer(): void {
        this.player = new Player(this, 168, 168).setOrigin(0.5)
    }

    private initCamera(): void {
        this.cameras.main.setSize(416, 288)
        this.cameras.main.setPosition(208, 32)
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09)
        this.cameras.main.setZoom(2)
    }

}