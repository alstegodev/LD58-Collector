import {Game, Scale, Types} from 'phaser';
import {LoadingScene} from "./scenes/loading";
import {Level1} from "./scenes/level-1";
import {UIScene} from "./scenes/ui";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 640,
    height: 360,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH,
    },
    render: {
        antialiasGL: false,
        pixelArt: true,
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
    autoFocus: true,
    audio: {
        disableWebAudio: false,
    },
    scene: [
        LoadingScene,
        Level1,
        UIScene
    ]
};

const StartGame = (parent: string) => {
    return new Game({...config, parent});
}

export default StartGame;
