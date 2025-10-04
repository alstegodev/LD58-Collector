import {Scene, Tilemaps} from "phaser";
import {Player} from "../../classes/player.ts";
import {EVENTS, getUserInputPayload} from "../../consts.ts";

export class Level1 extends Scene {

    private map!: Tilemaps.Tilemap;
    private tileSet!: Tilemaps.Tileset;

    private player!: Player;


    constructor() {
        super('level-1-scene');
    }

    create(): void {

        this.initMap();
        this.initPlayer();

        this.initCamera();

        this.initListeners();
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
        this.map.createLayer('Grass', this.tileSet, 0, 0);

        this.physics.world.setBounds(0, 0, 1600, 1600)
    }

    private initPlayer(): void {
        this.player = new Player(this, 168, 168).setOrigin(0.5)
    }

    private initCamera(): void {
        this.cameras.main.setSize(416, 288)
        this.cameras.main.setPosition(208, 32)
        this.cameras.main.startFollow(this.player, true)
        this.cameras.main.setZoom(2)
    }

    private initListeners(): void {
        this.game.events.on(EVENTS.EXEC_COMMAND, (commandList: ((player: Player) => void)[] = []) => {
            this.player.executeCommandList(commandList)
        })

        this.game.events.on(EVENTS.GET_USER_INPUT, (options: getUserInputPayload) => {
            console.log(options)

            this.askPlayer(options)
        })
    }

    private askPlayer(options: getUserInputPayload): void {
        const answers: Phaser.GameObjects.Arc[] = []
        const x = this.player.x
        const y = this.player.y

        const directions = [
            { key: "0", pos: { x: x, y: y - 40 } },      // Norden
            { key: "1", pos: { x: x + 40, y: y } },      // Osten
            { key: "2", pos: { x: x, y: y + 40 } },      // Süden
            { key: "3", pos: { x: x - 40, y: y } }       // Westen
        ];

        directions.forEach(({ key, pos }, index) => {
            if (options[key] !== undefined) {
                const circle = this.add.circle(pos.x, pos.y, 20, 0x000120).setInteractive();
                answers.push(circle);

                circle.on(Phaser.Input.Events.POINTER_DOWN, () => {
                    this.game.events.emit(EVENTS.USER_CHOICE_MADE, index);
                    this.cleanupChoices(answers);
                });
            }
        });
    }

    private cleanupChoices(answers: Phaser.GameObjects.Arc[]): void {
        answers.forEach((circle) => {
            circle.off(Phaser.Input.Events.POINTER_DOWN);
            circle.destroy();
        });
    }


}