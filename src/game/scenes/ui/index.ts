import Phaser, {Scene} from "phaser";
import {EVENTS, TEXTURES} from "../../consts.ts";
import {CommandBoard} from "../../classes/commandBoard.ts";
import {Card, Cards} from "../../classes/card.ts";
import {Text} from "../../classes/text.ts";
import Tween = Phaser.Tweens.Tween;

export class UIScene extends Scene {

    private commandBoard!: CommandBoard;
    private mainFilter!: Phaser.GameObjects.Rectangle;
    private bigRedButton!: Phaser.GameObjects.Sprite;

    private commandContainers: Phaser.GameObjects.Container[];
    private drawContainer!: Phaser.GameObjects.Container;
    private cardTweens: Tween[] = []

    constructor() {
        super('ui-scene');
    }

    create(): void {
        this.add.image(0, 0, TEXTURES.COMMAND_BOARD).setOrigin(0)
        this.mainFilter = this.add.rectangle(208, 32, 416, 288, 0x3f3f3f, 0).setOrigin(0)

        this.initCommandBoard();
        this.initBigRedButton();


        this.drawContainer = this.add.container(208, 32, [])

        this.drawCards()

        this.game.events.on(EVENTS.ALL_COMMANDS_EXECUTED, () => {
            this.drawCards()
        })
    }

    private initCommandBoard() {
        this.commandBoard = new CommandBoard(this)

        this.commandContainers = []
        for (let i = 0; i < 6; i++) {
            // this.add.rectangle(15, 32 + 45 * i, 170, 40, 0x000000).setOrigin(0)
            this.add.zone(15, 32 + 45 * i, 170, 40).setOrigin(0)
                .setRectangleDropZone(175, 42)
                .setData({commandslotIndex: i})

            this.commandContainers.push(this.add.container(15, 32 + 45 * i, []))
        }
    }

    private initBigRedButton() {
        this.bigRedButton = this.add.sprite(152, 320, TEXTURES.BIG_RED_BUTTON, 0).setInteractive()
    }

    private initListeners() {
        this.bigRedButton.anims.create({
            key: TEXTURES.BIG_RED_BUTTON,
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers(TEXTURES.BIG_RED_BUTTON, {
                frames: [0, 3, 2, 1],
            }),
        })
        this.bigRedButton.anims.play(TEXTURES.BIG_RED_BUTTON)

        this.tweens.add({
            targets: this.bigRedButton,
            duration: 500,
            scale: {
                start: 1,
                from: 1,
                to: 1.2
            },
            repeat: 2,
            yoyo: true,
        })

        this.bigRedButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.commandBoard.executeCommandLine()
            this.bigRedButton.anims.stop()
            this.bigRedButton.off(Phaser.Input.Events.POINTER_DOWN)
            this.bigRedButton.setScale(1)
        })
    }

    private drawCards() {
        this.tweens.add({
            targets: this.mainFilter,
            duration: 350,
            fillAlpha: 0.8,
        })

        let testText = new Text(this, 20, 50, "Choose a Command Card to add to your Command Board")
            .setFontSize(16)
            .setWordWrapWidth(376)
            .setAlign('center')
        this.drawContainer.add(testText)

        const positions = [
            {x: 20, y: 200},
            {x: 148, y: 200},
            {x: 276, y: 200},
        ];

        this.createDragEvents()

        positions.forEach((pos, index) => {
            let card = this.createCard(Math.floor(Math.random() * 12), pos.x, pos.y)
            card.texture.setData({...pos, index: index})
            card.texture.setInteractive({draggable: true})
            card.texture.setScale(1.25)
            card.texture.on(Phaser.Input.Events.POINTER_OVER, () => {
                this.cardTweens.push(this.tweens.add({
                    targets: card.texture,
                    duration: 350,
                    scale: 1.3,
                    repeat: 0
                }))
            })
            card.texture.on(Phaser.Input.Events.POINTER_OUT, () => {
                this.cardTweens.push(this.tweens.add({
                    targets: card.texture,
                    duration: 350,
                    scale: 1.25,
                    repeat: 0
                }))
            })
            this.drawContainer.add(card.texture)
            this.commandBoard.addDrawenCard(card, index)
        })

    }

    private createCard(index: number, x: number, y: number): Card {
        return {
            cardData: Cards[index],
            texture: this.add.image(x, y, TEXTURES.CARDS, index)
                .setOrigin(0)
        }
    }

    private createDragEvents(): void {
        this.createDragStartEventListener();
        this.createOnDragEventListener();
        this.createDragEndEventListener();
        this.createDropEventListener();
    }

    private createDragStartEventListener() {
        this.input.on(
            Phaser.Input.Events.DRAG_START,
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
                gameObject.setAlpha(0.8);
            },
        );
    }

    private createOnDragEventListener() {
        this.input.on(
            Phaser.Input.Events.DRAG,
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
                gameObject.setPosition(dragX, dragY);
            },
        );
    }

    private createDragEndEventListener(): void {
        this.input.on(
            Phaser.Input.Events.DRAG_END,
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
                if (gameObject.active) {
                    gameObject.setAlpha(1);
                    gameObject.setPosition(gameObject.getData('x') as number, gameObject.getData('y') as number);
                }
            },
        );
    }

    private createDropEventListener(): void {
        this.input.on(
            Phaser.Input.Events.DROP,
            (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
                const commandslotIndex = dropZone.getData('commandslotIndex') as number;
                this.handleMoveCardToCommandBoard(gameObject, commandslotIndex);
            },
        );
    }

    private handleMoveCardToCommandBoard(gameObject: Phaser.GameObjects.Image, targetCommandSlotIndex: number) {

        const droppedCard = this.commandBoard.getDrawenCard(gameObject.getData('index') as number)
        const cardIndex = droppedCard.cardData.frameIndex
        console.log('dropped card:', droppedCard)
        let isValidMove = this.commandBoard.canDropCardToSlot(droppedCard, targetCommandSlotIndex)
        console.log('isValidMove:', isValidMove)

        if (!isValidMove) {
            return
        }


        this.drawContainer.remove(gameObject, true);
        console.log(gameObject)

        const originalTargetCommandSlot = this.commandContainers[targetCommandSlotIndex];

        console.log('cardIndex:', cardIndex)
        console.log('dropped card:', droppedCard)
        const newCard = this.createCard(cardIndex, originalTargetCommandSlot.length * 32, 0)
        console.log('new card:', newCard)
        console.log('original target command slot:', originalTargetCommandSlot)
        originalTargetCommandSlot.add(newCard.texture)
        this.commandBoard.addCard(newCard, targetCommandSlotIndex)

        this.cleanUpDrawCards()
    }

    private cleanUpDrawCards() {
        console.log('clean up draw cards', this.cardTweens)
        this.cardTweens.forEach((tween) => {
            this.tweens.remove(tween)
            tween.destroy()
        })
        this.input.removeAllListeners()

        this.tweens.add({
            targets: this.mainFilter,
            duration: 350,
            fillAlpha: 0,
        })

        this.drawContainer.removeAll(true)

        this.initListeners()
    }
}