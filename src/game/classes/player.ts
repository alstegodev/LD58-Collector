import {Actor} from "./actor.ts";
import {EVENTS, getUserInputPayload, ORIENTATION, TEXTURES} from "../consts.ts";

export class Player extends Actor {

    private keyW: Phaser.Input.Keyboard.Key;
    private keyA: Phaser.Input.Keyboard.Key;
    private keyS: Phaser.Input.Keyboard.Key;
    private keyD: Phaser.Input.Keyboard.Key;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, TEXTURES.PLAYER);

        this.keyW = this.scene.input.keyboard!.addKey("W");
        this.keyA = this.scene.input.keyboard!.addKey("A");
        this.keyS = this.scene.input.keyboard!.addKey("S");
        this.keyD = this.scene.input.keyboard!.addKey("D");

        this.getBody().setSize(16, 16);
    }

    async update(): Promise<void> {
        this.getBody().setVelocity(0);
        if (this.keyW.isDown) {
            await this.setOrientation(ORIENTATION.NORTH);
            await this.move(1)
        }
        if (this.keyA.isDown) {
            await this.setOrientation(ORIENTATION.WEST);
            await this.move(1)
        }
        if (this.keyS.isDown) {
            await this.setOrientation(ORIENTATION.SOUTH);
            await this.move(1)
        }
        if (this.keyD.isDown) {
            await this.setOrientation(ORIENTATION.EAST);
            await this.move(1)
        }
    }

    public async executeCommandList(commandList: ((player: Player) => void | Promise<void>)[] = []) {
        console.log(commandList)
        for (let i = 0; i < commandList.length; i++) {
            const result = commandList[i](this);
            if (result instanceof Promise) {
                await result;
            }
        }

        this.scene.game.events.emit(EVENTS.ALL_COMMANDS_EXECUTED)
    }

    public async selectMove(distance: number): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene.game.events.emit(EVENTS.GET_USER_INPUT, {
                3: {
                    texture: TEXTURES.PLAYER,
                    value: 3,
                },
                0: {
                    texture: TEXTURES.PLAYER,
                    value: 0
                },
                1: {
                    texture: TEXTURES.PLAYER,
                    value: 1
                }
            })

            const handleUserChoice = async (choice: number) => {
                console.log('Spieler wählte:', choice);
                await this.move(distance, choice);

                this.scene.game.events.off(EVENTS.USER_CHOICE_MADE, handleUserChoice);
                resolve();
            };

            this.scene.game.events.on(EVENTS.USER_CHOICE_MADE, handleUserChoice);
        });
    }

    public async selectRotation(distance: number): Promise<void> {
        return new Promise<void>((resolve) => {

            let right = (4 + this.orientation + 1) % 4;
            let left = (4 + this.orientation - 1) % 4;
            console.log(right, left)

            let payload: getUserInputPayload = {
                [left]: {
                    texture: TEXTURES.PLAYER,
                    value: left,
                },
                [right]: {
                    texture: TEXTURES.PLAYER,
                    value: right
                }
            }
            if (distance == 2) {
                let behind = (this.orientation + 2) % 4;
                payload = {
                    ...payload,
                    [behind]: {
                        texture: TEXTURES.PLAYER,
                        value: behind
                    }
                }
            }
            this.scene.game.events.emit(EVENTS.GET_USER_INPUT, payload)

            const handleUserChoice = async (choice: number) => {
                console.log('Spieler wählte:', choice);
                await this.setOrientation(choice);

                this.scene.game.events.off(EVENTS.USER_CHOICE_MADE, handleUserChoice);
                resolve();
            };

            this.scene.game.events.on(EVENTS.USER_CHOICE_MADE, handleUserChoice);
        })


    }

    public async selectAttack(range: number, targets: number): Promise<void> {
        //
    }

    public async attackFrontal(targets: number): Promise<void> {
        //
    }

    public async attack(targets: number[][]): Promise<void> {
        //
    }

    public async chainAttack(jumps: number): Promise<void> {
        //
    }

}