export enum ORIENTATION {
    NORTH = 0,
    EAST = 1,
    SOUTH = 2,
    WEST = 3,
}

export enum TEXTURES {
    PLAYER = 'player',
    CARDS = 'cards',
    COMMAND_BOARD = 'commandBoard',
    BIG_RED_BUTTON = 'bigRedButton',
}

export enum EVENTS {
    EXEC_COMMAND = 'exec_command',
    GET_USER_INPUT = 'get_user_input',
    USER_CHOICE_MADE = 'user_choice_made',
    ALL_COMMANDS_EXECUTED = 'all_commands_executed',
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
