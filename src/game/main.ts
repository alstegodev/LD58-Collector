import {Game, Scale, Types} from 'phaser';
import {LoadingScene} from "./scenes/loading";
import {Level1} from "./scenes/level-1";
import {UIScene} from "./scenes/ui";
import {TitleScene} from "./scenes/title";
import {TutorialScene} from "./scenes/tutorial";


type GameConfigExtended = Types.Core.GameConfig & {
    startHealth: number,
    winScore: number
}

export const gameConfig: GameConfigExtended = {
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
        TitleScene,
        TutorialScene,
        Level1,
        UIScene
    ],
    winScore: 10,
    startHealth: 10
};

const StartGame = (parent: string) => {
    return new Game({...gameConfig, parent});
}

export default StartGame;
