export enum ORIENTATION {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3,
}

export enum TEXTURES {
    PLAYER = 'player',
    ENEMY = 'enemy',
    ATTACK = 'attack',
    CARDS = 'cards',
    COMMAND_BOARD = 'commandBoard',
    BIG_RED_BUTTON = 'bigRedButton',
    CHOOSE = 'choose',
    SKIP = 'skip',
    CLICKTOSTART = 'clickToStart',
    TITLE = 'title',
    TUTORIAL = 'tutorial',
    TUTORIAL2 = 'tutorial2',
    RESET = 'reset',
    HIDE = 'hide',

}

export enum EVENTS {
    EXEC_COMMAND = 'exec_command',
    GET_USER_INPUT = 'get_user_input',
    USER_CHOICE_MADE = 'user_choice_made',
    ALL_COMMANDS_EXECUTED = 'all_commands_executed',
    PLAYER_ATTACK = 'player_attack',
    FRONTAL_ATTACK = 'frontal_attack',
    TARGET_ATTACK = 'target_attack',
    CHAIN_ATTACK = 'chain_attack',
    RANGE_ATTACK = 'range_attack',
    DAMAGE = 'damage',
    KILL = 'kill'
}

export enum GAMESTATUS {
    PLAYING = 'playing',
    GAMEOVER = 'gameover',
    WIN = 'win'
}

export type InteractionPossibility = {
    texture: TEXTURES, // Gut!
    value: number
}

export type getUserInputPayload = {
    0?: InteractionPossibility, // Optional machen
    1?: InteractionPossibility,
    2?: InteractionPossibility,
    3?: InteractionPossibility,
}
