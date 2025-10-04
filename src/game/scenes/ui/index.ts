import {Scene} from "phaser";

export class UIScene extends Scene {

    private commandBoard!: Phaser.GameObjects.Image;

    constructor() {
        super('ui-scene');
    }

    create(): void {
        this.commandBoard = this.add.image(0, 0, 'commandBoard')
        this.commandBoard.setOrigin(0)
    }
}