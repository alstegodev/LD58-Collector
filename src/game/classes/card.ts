import {Player} from "./player.ts";

export type Card = {
    cardData: CardData,
    texture: Phaser.GameObjects.Image,
}

export type CardData = {
    name: string,
    frameIndex: number,
    color: string,
    exec: (power: number) => (player: Player) => void | Promise<void>,
}

export const Cards: CardData[] = [
    {
        name: 'omnistomp',
        frameIndex: 0,
        color: 'green',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.selectMove(power)
            }
        }
    },
    {
        name: 'memorycore',
        frameIndex: 1,
        color: 'green',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.selectRotation(power)
            }
        }
    },
    {
        name: 'aimbot',
        frameIndex: 2,
        color: 'green',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.selectAttack(power, 1)
            }
        }
    },
    {
        name: 'skewer',
        frameIndex: 3,
        color: 'blue',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.movePlayer(power)
            }
        }
    },
    {
        name: 'scythe',
        frameIndex: 4,
        color: 'blue',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.selectRotation(power)
                await player.selectAttack(1, 1)
            }
        }
    },
    {
        name: 'ripsaw',
        frameIndex: 5,
        color: 'blue',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.attackFrontal(power)
            }
        }
    },
    {
        name: 'blaze',
        frameIndex: 6,
        color: 'red',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.movePlayer(power)
                await player.attack([[1, 0], [-1, 0]])
            }
        }
    },
    {
        name: 'fueltank',
        frameIndex: 7,
        color: 'red',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.selectRotation(power)
            }
        }
    },
    {
        name: 'flamespitter',
        frameIndex: 8,
        color: 'red',
        exec: (power: number) => {
            return async (player: Player) => {
                let targets = [
                    [],
                    [[0, 1], [0, 2]],
                    [[0, 1], [0, 2], [1, 2], [-1, 2]],
                    [[0, 1], [0, 2], [1, 2], [-1, 2], [0, 3], [1, 3], [-1, 3]]
                ]

                await player.attack(targets[power])
            }
        }
    },
    {
        name: 'speed',
        frameIndex: 9,
        color: 'yellow',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.movePlayer(2 * power)
            }
        }
    },
    {
        name: 'cyclotron',
        frameIndex: 10,
        color: 'yellow',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.selectRotation(power)
                await player.attack([[1, 1], [-1, -1], [1, -1], [-1, 1]])
            }
        }
    },
    {
        name: 'chainlightning',
        frameIndex: 11,
        color: 'yellow',
        exec: (power: number) => {
            return async (player: Player) => {
                await player.chainAttack(3 + (2 * power))
            }
        }
    },
] as const