import Phaser, {Scene} from "phaser";
import {EVENTS, GAMESTATUS, TEXTURES} from "../../consts.ts";
import {CommandBoard} from "../../classes/commandBoard.ts";
import {Card, Cards} from "../../classes/card.ts";
import {Text} from "../../classes/text.ts";
import {gameConfig} from "../../main.ts";
import Tween = Phaser.Tweens.Tween;

export class UIScene extends Scene {

    private commandBoard!: CommandBoard;
    private mainFilter!: Phaser.GameObjects.Rectangle;
    private bigRedButton!: Phaser.GameObjects.Sprite;

    private score = 0;
    private scoreBoard: Text;

    private health = 5;
    private healthBoard: Text;

    private commandContainers: Phaser.GameObjects.Container[];
    private drawContainer!: Phaser.GameObjects.Container;
    private cardTweens: Tween[]

    private resetButton: Phaser.GameObjects.Image;

    constructor() {
        super('ui-scene');
    }

    create(): void {
        this.add.image(0, 0, TEXTURES.COMMAND_BOARD).setOrigin(0)
        this.mainFilter = this.add.rectangle(208, 32, 416, 288, 0x3f3f3f, 0).setOrigin(0)

        this.initCommandBoard();
        this.initBigRedButton();

        this.cardTweens = []

        this.score = 0;
        this.scoreBoard = new Text(this, 538, 32, `Score: ${this.score}/${gameConfig.winScore}`).setFontSize(12)
        this.game.events.on(EVENTS.KILL, () => {
            console.log('catch KILL')
            this.score++;
            this.scoreBoard.text = `Score: ${this.score}/${gameConfig.winScore}`

            if (this.score >= gameConfig.winScore) {
                this.endGame(GAMESTATUS.WIN);
            }
        })

        this.health = gameConfig.startHealth;
        this.healthBoard = new Text(this, 210, 32, `Health: ${this.health}`).setFontSize(12)
        this.game.events.on(EVENTS.DAMAGE, () => {
            console.log('catch DAMAGE')
            this.cameras.main.shake(200, 0.1);
            this.health--;
            this.healthBoard.text = `Health: ${this.health}`
            if (this.health <= 0) {
                this.endGame(GAMESTATUS.GAMEOVER);
            }

        })

        this.resetButton = this.add.image(620, 340, TEXTURES.RESET).setOrigin(0).setInteractive()
        this.resetButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.restartGame()
        })

        this.drawContainer = this.add.container(208, 32, [])

        this.drawCards()

        this.game.events.on(EVENTS.ALL_COMMANDS_EXECUTED, () => {
            if (this.health > 0) {
                this.drawCards()
            }
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
        this.bigRedButton.anims.create({
            key: TEXTURES.BIG_RED_BUTTON,
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers(TEXTURES.BIG_RED_BUTTON, {
                frames: [0, 3, 2, 1],
            }),
        })
    }

    private initListeners() {
        console.log('BIG RED BUTTON')
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
            this.bigRedButton.anims.stop()
            this.bigRedButton.off(Phaser.Input.Events.POINTER_DOWN)
            this.bigRedButton.setScale(1)
            this.commandBoard.executeCommandLine()
        })
    }

    private drawCards() {
        this.tweens.add({
            targets: this.mainFilter,
            duration: 350,
            fillAlpha: 0.8,
        })

        let extraCard: boolean = this.commandBoard.getCommandSlots().some((slot) => {

            if (slot.length > 0) {
                return slot[slot.length - 1].cardData.frameIndex === 1
            }
            return false
        })

        let testText = new Text(this, 20, 50, "Choose a Command Card to add to your Command Board")
            .setFontSize(16)
            .setWordWrapWidth(376)
            .setAlign('center')
        this.drawContainer.add(testText)


        const positionWithExtraCard = [
            {x: 20, y: 200},
            {x: 148, y: 200},
            {x: 276, y: 200},
            {x: 148, y: 152},
        ]

        const positions =
            extraCard ? positionWithExtraCard :
                [
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

        let skip = this.add.image(160, 250, TEXTURES.SKIP).setOrigin(0).setInteractive()
        skip.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.cleanUpDrawCards()
        })

        let hide = this.add.image(5, 270, TEXTURES.HIDE).setOrigin(0).setInteractive()
        hide.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.hideDrawContainer(true)
        })

        hide.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.hideDrawContainer(false)
        })

        hide.on(Phaser.Input.Events.POINTER_UP, () => {
            this.hideDrawContainer(false)
        })

        this.drawContainer.add(hide)
        this.drawContainer.add(skip)
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

    private hideDrawContainer(hide: boolean) {
        if (hide) {
            this.drawContainer.setVisible(false)
        } else {
            this.drawContainer.setVisible(true)
        }
    }

    private endGame(status: GAMESTATUS) {
        this.resetButton.destroy()

        this.cameras.main.setBackgroundColor("rgba(0,0,0,0.6)");
        this.game.scene.pause("level-1-scene");
        let gameEndPhrase = new Text(
            this,
            this.scene.get("level-1-scene").scale.width / 2,
            this.scene.get("level-1-scene").scale.height * 0.4,
            status === GAMESTATUS.GAMEOVER
                ? `YOU DIED!\nCLICK TO RESTART`
                : `CONGRATULATION!\nYOU REALLY SHOWED\nTHEM WHO'S BOSS\n\nCLICK TO RESTART`,
        )
            .setAlign("center")
            .setColor(status === GAMESTATUS.GAMEOVER ? "#ff0000" : "#00ff00")
            .setFontSize(24)
            .setWordWrapWidth(350)

        gameEndPhrase.setPosition(
            (this.scene.get("level-1-scene").scale.width / 2 - gameEndPhrase.width / 2) + 100,
            this.scene.get("level-1-scene").scale.height * 0.4,
        );

        this.input.on("pointerdown", () => {
            this.restartGame();
        });
    };

    private restartGame() {
        this.game.events.removeAllListeners()

        this.scene.get("level-1-scene").scene.stop();
        this.scene.start("level-1-scene");
        this.scene.restart();
    }
}