import {Actor} from "./actor.ts";
import {EVENTS, getUserInputPayload, ORIENTATION, TEXTURES} from "../consts.ts";
import {sleep} from "../helper.ts";

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
            await sleep(200)
        }
    }



    public async movePlayer(distance: number) {
        this.attackMove(distance, this.orientation);
        await this.move(distance)
    }

    public async selectMove(distance: number, back?: boolean = false): Promise<void> {
        return new Promise<void>((resolve) => {
            if(back) {
                this.scene.game.events.emit(EVENTS.GET_USER_INPUT, {
                    [this.orientation]: {
                        texture: TEXTURES.PLAYER,
                        value: this.orientation,
                    },
                    [(this.orientation + 2) % 4]: {
                        texture: TEXTURES.PLAYER,
                        value: 0
                    },
                })
            } else {
                this.scene.game.events.emit(EVENTS.GET_USER_INPUT, {
                    [this.orientation]: {
                        texture: TEXTURES.PLAYER,
                        value: this.orientation,
                    },
                    [(this.orientation + 1) % 4]: {
                        texture: TEXTURES.PLAYER,
                        value: 0
                    },
                    [(4 + this.orientation - 1) % 4]: {
                        texture: TEXTURES.PLAYER,
                        value: 1
                    }
                })
            }



            const handleUserChoice = async (choice: number) => {
                console.log('User choice: ', choice);
                this.attackMove(distance, choice);
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
            if (distance >= 2) {
                let behind = (this.orientation + 2) % 4;
                payload = {
                    ...payload,
                    [behind]: {
                        texture: TEXTURES.PLAYER,
                        value: behind
                    }
                }
            }
            if(distance == 3) {
                let infront = (this.orientation + 4) % 4;
                payload = {
                    ...payload,
                    [infront]: {
                        texture: TEXTURES.PLAYER,
                        value: infront
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
        console.log('EMIT RANGE_ATTACK')
        this.scene.game.events.emit(EVENTS.RANGE_ATTACK, range, targets);
    }

    public async attackFrontal(targets: number): Promise<void> {
        console.log('EMIT FRONTAL_ATTACK')
        this.scene.game.events.emit(EVENTS.FRONTAL_ATTACK, this.orientation, targets);
        this.scene.game.events.emit(EVENTS.FRONTAL_ATTACK, (2 + this.orientation) % 4, targets);
    }

    public async attack(targets: number[][]): Promise<void> {
        console.log('EMIT TARGETED ATTACK')
        this.scene.game.events.emit(EVENTS.TARGET_ATTACK, targets.map(target => {
            let rotatedX: number, rotatedY: number;

            switch (this.orientation) {
                case ORIENTATION.NORTH:
                    rotatedX = target[0];
                    rotatedY = -target[1];
                    break;
                case ORIENTATION.EAST:
                    rotatedX = target[1];
                    rotatedY = target[0];
                    break;
                case ORIENTATION.SOUTH:
                    rotatedX = -target[0];
                    rotatedY = target[1];
                    break;
                case ORIENTATION.WEST:
                    rotatedX = -target[1];
                    rotatedY = -target[0];
                    break;
                default:
                    rotatedX = target[0];
                    rotatedY = target[1];
            }

            return {
                x: (rotatedX * 16) + this.x,
                y: (rotatedY * 16) + this.y
            }
        }))
    }

    public async chainAttack(jumps: number): Promise<void> {
        console.log('EMIT CHAIN_ATTACK')
        this.scene.game.events.emit(EVENTS.CHAIN_ATTACK, jumps);
    }

    private attackMove(distance: number, choice: ORIENTATION) {
        let attack_Fields: { x: number, y: number }[] = []
        for (let i = 1; i <= distance; i++) {
            switch (choice) {
                case ORIENTATION.NORTH:
                    attack_Fields.push({
                        x: this.x,
                        y: this.y - 16 * i
                    });
                    break;
                case ORIENTATION.SOUTH:
                    attack_Fields.push({
                        x: this.x,
                        y: this.y + 16 * i
                    });
                    break;
                case ORIENTATION.EAST:
                    attack_Fields.push({
                        x: this.x + 16 * i,
                        y: this.y,
                    });
                    break;
                case ORIENTATION.WEST:
                    attack_Fields.push({
                        x: this.x - 16 * i,
                        y: this.y,
                    });
                    break;
            }
        }
        console.log('Attack on coords: ', attack_Fields)
        this.scene.game.events.emit(EVENTS.PLAYER_ATTACK, attack_Fields)
    }

}