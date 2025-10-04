import {Card} from "./card";
import {EVENTS} from "../consts.ts";
import {Player} from "./player.ts";

export class CommandBoard {

    protected commandSlots: Card[][] = []
    protected drawenCards: Card[] = []
    protected scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        for (let i = 0; i < 6; i++) {
            this.commandSlots.push([])
        }
    }

    public addCard(card: Card, index: number) {
        this.commandSlots[index].push(card)
        console.log(this.commandSlots)
    }

    public addDrawenCard(card: Card, index: number) {
        this.drawenCards[index] = card
    }

    public getDrawenCard(index: number) {
        return this.drawenCards[index]
    }

    public canDropCardToSlot(card: Card, targetCommandSlotIndex: number): boolean {
        if (this.commandSlots[targetCommandSlotIndex].length === 3) { return false }
        if (this.commandSlots[targetCommandSlotIndex].length === 0) { return true }
        console.log(card, this.commandSlots[targetCommandSlotIndex][0])
        return card.cardData.color === this.commandSlots[targetCommandSlotIndex][0].cardData.color
    }

    public executeCommandLine(): void {
        let commandList: ((player: Player) => void)[] = []
        for (let i = 0; i < 6; i++) {
            if (this.commandSlots[i].length !== 0) {
                commandList.push(this.commandSlots[i][this.commandSlots[i].length - 1].cardData.exec(this.commandSlots[i].length))
            }
        }
        this.scene.game.events.emit(EVENTS.EXEC_COMMAND, commandList)
    }

}
