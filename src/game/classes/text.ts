import {GameObjects} from "phaser";

export class Text extends GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
        super(scene, x, y, text, {
            fontSize: "calc(100vw / 25)",
            color: "#fff",
            stroke: "#000",
            strokeThickness: 4,
            wordWrap: {width: 200, useAdvancedWrap: true}
        });
        this.setOrigin(0, 0);
        scene.add.existing(this);
    }

    setFontSize(size: string | number): this {
        return super.setFontSize(size);
    }

    setWordWrapWidth(width: number | null, useAdvancedWrap?: boolean): this {
        return super.setWordWrapWidth(width, useAdvancedWrap);
    }
}
