import {Scene, Tilemaps} from "phaser";
import {Player} from "../../classes/player.ts";
import {EVENTS, getUserInputPayload, ORIENTATION, TEXTURES} from "../../consts.ts";
import {Enemy} from "../../classes/enemy.ts";
import {gameObjectsToObjectPoints, sleep} from "../../helper.ts";

export class Level1 extends Scene {

    private map!: Tilemaps.Tilemap;
    private tileSet!: Tilemaps.Tileset;
    private wallsLayer!: Tilemaps.TilemapLayer;
    private enemySpawns!: Phaser.GameObjects.Sprite[];

    private player!: Player;
    private enemies: Enemy[];


    constructor() {
        super('level-1-scene');
    }

    create(): void {

        this.initMap();
        this.initPlayer();
        this.enemies = [];
        this.initEnemySpawn();
        this.initCamera();
        this.initListeners();
    }

    async update() {
        await this.player.update();
        for (const enemy of this.enemies) {
            await enemy.update();
        }
    }

    private initMap(): void {
        this.map = this.make.tilemap({
            key: 'dungeon',
            tileWidth: 16,
            tileHeight: 16
        })

        this.tileSet = this.map.addTilesetImage('Tileset', 'tiles')!;
        this.map.createLayer('Map', this.tileSet, 0, 0);
        this.wallsLayer = this.map.createLayer("Wall", this.tileSet, 0, 0)!;
        this.wallsLayer.setCollisionByProperty({obstacle: true});
        this.physics.world.setBounds(0, 0, 1600, 1600)
    }

    private initPlayer(): void {
        this.player = new Player(this, 248, 1368).setOrigin(0.5)
        this.physics.add.collider(this.player, this.wallsLayer);
    }

    private initEnemySpawn(): void {
        const spawnPoints = gameObjectsToObjectPoints(
            this.map.filterObjects("EnemySpawns", (obj) => obj.name === "Spawn")!,
        );

        this.enemySpawns = spawnPoints.map((spawnPoint) =>
            this.physics.add
                .sprite(spawnPoint.x, spawnPoint.y, "tiles_spr", 7)
                .setScale(1),
        );

        this.enemySpawns.forEach((spawnPoint) => {
            spawnPoint.anims.create({
                key: 'tiles',
                frameRate: 4,
                duration: -1,
                repeat: -1,
                randomFrame: true,
                frames: this.anims.generateFrameNumbers('tiles_spr', {
                    frames: [10, 9, 8, 7],
                }),
            })
            spawnPoint.play('tiles')

            this.physics.add.overlap(this.player, spawnPoint, (_obj1, obj2) => {
                let index = this.enemySpawns.indexOf(spawnPoint)
                this.enemySpawns.splice(index, 1)
                obj2.destroy();
                this.cameras.main.flash(250);
                sleep(100).then(_r => this.game.events.emit(EVENTS.KILL))
            });
        });

        this.game.events.on(EVENTS.ALL_COMMANDS_EXECUTED, () => {
            console.log('CATCH ALL_COMMANDS_EXECUTED')
            this.enemySpawns.forEach((spawnPoint) => {
                this.spawnEnemy({x: spawnPoint.x, y: spawnPoint.y})
            })
        })
    }

    private initCamera(): void {
        this.cameras.main.setSize(416, 288)
        this.cameras.main.setPosition(208, 32)
        this.cameras.main.startFollow(this.player, true)
        this.cameras.main.setZoom(2)
    }

    private initListeners(): void {
        this.game.events.on(EVENTS.EXEC_COMMAND, (commandList: ((player: Player) => void)[] = []) => {
            this.player.executeCommandList(commandList).then(async _r => {
                    // Concurrent enemy turn with simple reservation to avoid overlaps
                    const walls = this.wallsLayer;

                    type MovePlan = { enemy: Enemy, dir: ORIENTATION, nx: number, ny: number };
                    const movers: MovePlan[] = [];
                    const reserved = new Set<string>();
                    const occupiedNow = new Set(this.enemies.map(e => `${e.x},${e.y}`));

                    const stepForDir = (dir: ORIENTATION) => {
                        switch (dir) {
                            case ORIENTATION.NORTH:
                                return {dx: 0, dy: -16};
                            case ORIENTATION.SOUTH:
                                return {dx: 0, dy: 16};
                            case ORIENTATION.EAST:
                                return {dx: 16, dy: 0};
                            case ORIENTATION.WEST:
                                return {dx: -16, dy: 0};
                        }
                    };

                    const wantsToMove = (enemy: Enemy): MovePlan | null => {
                        const xDiff = Math.abs(this.player.x - enemy.x);
                        const yDiff = Math.abs(this.player.y - enemy.y);

                        // Skip adjacent enemies - they will be handled separately for attack
                        if (xDiff + yDiff <= 16) {
                            return null;
                        }

                        let dir: ORIENTATION;
                        if (xDiff > yDiff) {
                            dir = (this.player.x > enemy.x) ? ORIENTATION.EAST : ORIENTATION.WEST;
                        } else {
                            dir = (this.player.y > enemy.y) ? ORIENTATION.SOUTH : ORIENTATION.NORTH;
                        }
                        const {dx, dy} = stepForDir(dir)!;
                        const nx = enemy.x + dx;
                        const ny = enemy.y + dy;

                        // Block moving into player tile
                        if (nx === this.player.x && ny === this.player.y) return null;

                        // Block walls
                        if (walls) {
                            const tile = walls.getTileAtWorldXY(nx, ny);
                            if (tile && ((tile.properties && (tile.properties as any).obstacle === true) || (tile as any).collides === true)) {
                                return null;
                            }
                        }

                        // Don't allow stepping into a currently occupied tile (conservative, avoids swaps)
                        if (occupiedNow.has(`${nx},${ny}`)) return null;

                        // Reserve if free
                        if (reserved.has(`${nx},${ny}`)) return null;
                        reserved.add(`${nx},${ny}`);
                        return {enemy, dir, nx, ny};
                    };

                    // First pass: decide moves
                    for (const enemy of this.enemies) {
                        const plan = wantsToMove(enemy);
                        if (plan) movers.push(plan);
                    }

                    // Build obstacles list as player + non-movers
                    const movingSet = new Set(movers.map(m => m.enemy));
                    const nonMovers = this.enemies.filter(e => !movingSet.has(e));
                    const obstacles: (Player | Enemy)[] = [this.player, ...nonMovers];

                    // Execute all moves in parallel first
                    await Promise.all(movers.map(m => m.enemy.move(1, m.dir, obstacles)));

                    await sleep(200);

                    // After all moves are complete, check for attacks
                    const attacks: Enemy[] = [];
                    for (const enemy of this.enemies) {
                        const xDiff = Math.abs(this.player.x - enemy.x);
                        const yDiff = Math.abs(this.player.y - enemy.y);
                        if (xDiff + yDiff <= 16) {
                            attacks.push(enemy);
                        }
                    }

                    // Execute attacks after movement
                    for (const _ of attacks) {
                        this.scene.get("level-1-scene")
                        this.game.events.emit(EVENTS.DAMAGE);
                    }
                    sleep(200).then(_r => {
                        this.game.events.emit(EVENTS.ALL_COMMANDS_EXECUTED)
                    })

                }
            )
        })

        this.game.events.on(EVENTS.GET_USER_INPUT, (options: getUserInputPayload) => {
            console.log(options)

            this.askPlayer(options)
        })

        this.game.events.on(EVENTS.PLAYER_ATTACK, (attack_field: { x: number, y: number }[]) => {
            for (let attack of attack_field) {
                this.destroyEnemy(attack)
            }
        })

        this.game.events.on(EVENTS.FRONTAL_ATTACK, (direction: ORIENTATION, targets: number) => {
            console.log('CATCH FRONTAL', direction, targets)
            let originX = this.player.x;
            let originY = this.player.y;
            let hitEnemies = this.enemies.filter(enemy => {
                switch (direction) {
                    case ORIENTATION.NORTH:
                        return (enemy.x === originX && enemy.y < originY);
                    case ORIENTATION.SOUTH:
                        return (enemy.x === originX && enemy.y > originY);
                    case ORIENTATION.EAST:
                        return (enemy.x > originX && enemy.y === originY);
                    case ORIENTATION.WEST:
                        return (enemy.x < originX && enemy.y === originY);
                    default:
                        return false
                }
            })
            console.log('hitEnemies:', hitEnemies)
            if (hitEnemies.length > 0) {
                hitEnemies.sort(
                    (e1) => {
                        return -Phaser.Math.Distance.BetweenPoints({x: originX, y: originY}, {x: e1.x, y: e1.y})
                    }
                )
                const targetCount = Math.min(targets, hitEnemies.length);
                for (let i = 0; i < targetCount; i++) {
                    this.displayAttack({x: hitEnemies[i].x, y: hitEnemies[i].y})
                    hitEnemies[i].destroy()
                    this.enemies = this.enemies.filter(e1 => e1.x != hitEnemies[i].x || e1.y != hitEnemies[i].y)
                }
            }
        })

        this.game.events.on(EVENTS.TARGET_ATTACK, (targets: { x: number, y: number }[]) => {
            console.log('CATCH TARGET_ATTACK', targets)
            targets.forEach(target => {
                this.displayAttack(target)
                this.destroyEnemy(target)
            })
        })

        this.game.events.on(EVENTS.CHAIN_ATTACK, (jumps: number) => {
            console.log('CATCH CHAIN_ATTACK', jumps)
            let hit = true;
            let origin = {x: this.player.x, y: this.player.y}

            while (hit && jumps > 0) {
                hit = false;
                let targets = [
                    {x: origin.x + 16, y: origin.y + 16},
                    {x: origin.x - 16, y: origin.y - 16},
                    {x: origin.x + 16, y: origin.y - 16},
                    {x: origin.x - 16, y: origin.y + 16},
                ]
                targets.forEach(target => {
                    this.displayAttack(target)
                    if (this.destroyEnemy(target)) {
                        hit = true
                        jumps--
                        origin = target
                    }
                })
            }
        })

        this.game.events.on(EVENTS.RANGE_ATTACK, (range: number, targets: number) => {
            console.log('CATCH RANGE_ATTACK', range, targets);
            let originX = this.player.x;
            let originY = this.player.y;

            let hitEnemies = this.enemies.filter(enemy => {
                const distance = Phaser.Math.Distance.Between(originX, originY, enemy.x, enemy.y);
                console.log('distance:', distance);
                return distance <= range * 23;
            });

            if (hitEnemies.length > 0) {
                hitEnemies.sort((e1, e2) => {
                    const dist1 = Phaser.Math.Distance.Between(originX, originY, e1.x, e1.y);
                    const dist2 = Phaser.Math.Distance.Between(originX, originY, e2.x, e2.y);
                    return dist1 - dist2;
                });

                const targetCount = Math.min(targets, hitEnemies.length);
                for (let i = 0; i < targetCount; i++) {
                    this.displayAttack({x: hitEnemies[i].x, y: hitEnemies[i].y});
                    this.destroyEnemy({x: hitEnemies[i].x, y: hitEnemies[i].y});
                }
            }
        })
    }

    private spawnEnemy(target: { x: number, y: number }): void {
        if (this.enemies.some(enemy => enemy.x === target.x && enemy.y === target.y)) {
            return
        }

        if (this.player.x === target.x && this.player.y === target.y) {
            return
        }

        this.enemies.push(new Enemy(this, target.x, target.y, this.player, this.enemies).setOrigin(0.5))
    }

    private destroyEnemy(target: { x: number, y: number }): boolean {
        let pEnemy = this.enemies.find((enemy) => enemy.x == target.x && enemy.y == target.y)
        if (pEnemy) {
            this.enemies = this.enemies.filter((enemy) => enemy.x != target.x || enemy.y != target.y)
            pEnemy.destroy()
            return true
        }
        return false
    }

    private displayAttack(target: { x: number, y: number }) {
        let attack = this.add.image(target.x, target.y, TEXTURES.ATTACK)
        this.tweens.add({
            targets: attack,
            duration: 800,
            yoyo: false,
            repeat: 0,
            ease: 'Sine.easeInOut',
            alpha: {
                start: 0.8,
                from: 1,
                to: 0
            },
            onComplete: () => {
                attack.destroy()
            }
        })
    }

    private askPlayer(options: getUserInputPayload): void {
        const answers: Phaser.GameObjects.Sprite[] = []
        const x = this.player.x
        const y = this.player.y

        const directions = [
            {key: "0", pos: {x: x, y: y - 40}},      // Norden
            {key: "1", pos: {x: x + 40, y: y}},      // Osten
            {key: "2", pos: {x: x, y: y + 40}},      // Süden
            {key: "3", pos: {x: x - 40, y: y}}       // Westen
        ];

        directions.forEach(({key, pos}, index) => {
            if (options[key] !== undefined) {

                // const circle = this.add.circle(pos.x, pos.y, 20, 0x000120).setInteractive();
                const circle = this.add.sprite(pos.x, pos.y, TEXTURES.CHOOSE, index).setOrigin(0.5).setInteractive();
                answers.push(circle);

                circle.on(Phaser.Input.Events.POINTER_DOWN, () => {
                    this.game.events.emit(EVENTS.USER_CHOICE_MADE, index);
                    this.cleanupChoices(answers);
                });
            }
        });
    }

    private cleanupChoices(answers: Phaser.GameObjects.Sprite[]): void {
        answers.forEach((circle) => {
            circle.off(Phaser.Input.Events.POINTER_DOWN);
            circle.destroy();
        });
    }

}