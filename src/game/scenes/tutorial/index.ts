import Phaser from "phaser";
import {TEXTURES} from "../../consts.ts";

export class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'tutorial-scene' });
    }

    public create(): void {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1).setOrigin(0);
        this.add.image(0, 0, TEXTURES.TUTORIAL2).setOrigin(0).setOrigin(0).setInteractive();
        let tutorial1 = this.add.image(0, 0, TEXTURES.TUTORIAL).setOrigin(0).setInteractive();

        this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
            this.tweens.add({
                targets: tutorial1,
                alpha: {
                    start: 1,
                    from: 1,
                    to: 0,
                },
                duration: 750,
                repeat:0,
                onComplete: () => {
                    tutorial1.destroy();
                }
            })


            this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
                this.cameras.main.fadeOut(750, 0, 0, 0, (camera, progress: number) => {
                    if (progress !== 1) {
                        return;
                    }

                    this.scene.start('level-1-scene');
                    this.scene.start('ui-scene');
                });
            });

        });
    }
}