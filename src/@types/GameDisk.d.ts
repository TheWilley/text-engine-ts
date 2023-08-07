/* eslint-disable no-empty-pattern */

/*
Global type defentions would be a bad idea here if this was a library, but per https://www.reddit.com/r/typescript/comments/126im5c/dts_files_on_a_ts_project/
it would be fine here since this is more of an app
*/

/**
 * Defines types for avaible objects in callbacks.
 */
type CallbackObjects = {
    /**
     * A disk is a function which returns a JavaScript object that describes your game. At minimum, that object must have these two top-level properties:
    */
    disk?: GameDiskObject,
    /**
     * Print a line of text to the console. It takes up to two arguments:
     * @param line The text to be printed.
     * @param className *Optional*. The name of a CSS class to apply to the line. You can use this to style the text.
     */
    println?: Println
    /**
     * A room is a JavaScript object. You usually want a room to have the following properties:
     */
    room?: Room,
    /**
     * Get a reference to a room by its ID. It takes one argument:
     * @param id The unique identifier for the room.
     * @returns A reference to the room, or undefined if no room with that ID exists.
     */
    getRoom?: GetRoom
    /**
     * Move the player to particular room. It takes one argument:
     * @param id The unique identifier for the room.
     */
    enterRoom?: EnterRoom
    /**
     * An item is an object with a name
     */
    item?: Item
    /**
     * A character is an object with a name
     */
    character?: Character
}

/**
 * An item is an object with a name:
 */
type Item = {
    /**
     * How the item is referred to by the game and the player. Using an array allows you to define multiple string names for the item. You might do this if you expect the player may call it by more than one name. For instance ['basketball', 'ball']. When listing items in a room, the engine will always use the first name in the list.
     */
    name?: string | string[];
    /**
     * Description displayed when the player looks at the item. If multiple descriptions are provided, one will be chosen at random.
     */
    desc?: string | string[];
    /**
     * Whether the player can pick up this item (if it's in a room). Defaults to false.
     */
    isTakeable?: boolean;
    /**
     * Function to be called when the player uses the item.
     */
    onUse?: (args?: CallbackObjects) => void;
    /**
     * Function to be called when the player looks at the item.
     */
    onLook?: (args?: CallbackObjects) => void;
    /**
     * Function to be called when the player takes the item.
     */
    onTake?: (args?: CallbackObjects) => void;
    /**
     * Weather the item is hidden from the player.
     */
    isHidden?: boolean;
    /**
     * Reason player cannot pick up an item.
     */
    block?: string
    /**
     * @deprecated Use `onUse` instead.
     */
    use?: (args?: CallbackObjects) => void;
    /**
     * *Custom property*.
     */
    [key: string]: unknown;
}

/**
 * A character is an object with the following properties:
 */
type Character = {
    /**
     * How the character is referred to by the game and the player. Using an array allows you to define multiple string names for the character. You might do this if you expect the player may call them by more than one name. For instance ['Steve', 'waiter', 'garçon']. When listing characters in a room, the engine will always use the first name in the list.
     */
    name?: string | string[];
    /**
     * The ID of the room the character is currently in. The player can only talk to characters in the room with them.
     */
    roomId?: string;
    /**
     * Description. Text displayed when the player looks at the character. If multiple descriptions are provided, one will be chosen at random.
     */
    desc?: string | string[];
    /**
     * If a string is provided, it will be printed when the player talks to this character. Otherwise, this should be a list of topics for use in the conversation with the character.
     */
    topics?: string | Topic[] | ((args?: CallbackObjects) => string | Topic[]);
    /**
     * Function to be called when the player talks to the character.
     */
    onTalk?: (args?: CallbackObjects) => void;
    /**
     * Function to be called when the player looks at the character.
     */
    onLook?: (args?: CallbackObjects) => void;
    /**
     * Player's conversation history with this character.
     */
    chatLog?: string[];
    /**
     * Whether the character is hidden from the player.
     */
    isHidden?: boolean;
    /**
     * *Custom property*.
     */
    [key: string]: unknown;
}

/**
 * A topic is something you can talk to a character about, and as you may have guessed, is a JavaScript object. A topic requires an option, and either a line or an onSelected function, or both:
 */
type Topic = {
    /**
     * The choice presented to the player, with a KEYWORD the player can type to select it. If the keyword is written in uppercase, the engine can identify it automatically. (Otherwise, you'll need to specify the keyword in a separate property.) The option can be just the keyword itself, or any string containing the keyword.
     */
    option?: string;
    /**
     * The text to display when the user types the keyword to select the option.
     */
    line?: string;
    /**
     * Function to be called when the player types the keyword to select the option.
     */
    onSelected?: (args?: CallbackObjects) => void;
    /**
     * Whether this option should no longer be available to the player after it has been selected once.
     */
    removeOnRead?: boolean;
    /**
     * Array of keyword strings representing the prerequisite topics a player must have selected before this one will appear. (When topics are selected, their keywords go into an array on the character called "chatLog".)
     */
    prereqs?: string[];
    /**
     * The word the player must type to select this option. This property is only required if the option itself does not contain a keyword written in uppercase.
     */
    keyword?: string;
    /**
     * *Custom property*.
     */
    [key: string]: unknown;
}

/**
 * An exit is an object with the following properties:
 */
type Exit = {
    /**
     * The direction the player must go to leave via this exit (e.g. "north", but can be anything)
     */
    dir?: string | string[];
    /**
     * The ID of the room this exit leads to.
     */
    id?: string;
    /**
     * Line to be printed if the player tries to use this exit. If this property exists, the player cannot use the exit.
     */
    block?: string;
    /**
     * Weather the exit is hidden from the player.
     */
    isHidden?: boolean;
    /**
     * *Custom property*.
     */
    [key: string]: unknown;
}

/**
 * A room is a JavaScript object. You usually want a room to have the following properties:
 */
type Room = {
    /**
     * Unique identifier for this room. Can be anything.
     */
    id?: string;
    /**
     * The name of the room will be displayed each time it is entered.
     */
    name?: string;
    /**
     * Description of the room, displayed when it is first entered, and also when the player issues the look command.
     */
    desc?: string;
    /**
     * List of paths from this room.
     */
    exits?: Exit[];
    /**
     * Graphic to be displayed each time the room is entered. (This is intended to be ASCII art.)
     */
    img?: string;
    /**
     * List of items in this room. Items can be interacted with by the player.
     */
    items?: Item[];
    /**
     * Function to be called when the player enters this room.
     */
    onEnter?: (args?: CallbackObjects) => void;
    /**
     * Function to be called when the player issues the look command in this room.
     */
    onLook?: (args?: CallbackObjects) => void;
    /**
     * *Developer-only property*.
     */
    visits?: number;
    /**
     * *Custom property*.
     */
    [key: string]: unknown;
}

/**
 * A disk is a function which returns a JavaScript object that describes your game. At minimum, that object must have these two top-level properties:
 */
interface GameDiskObject {
    /**
     * This is a reference to the room the player currently occupies. Set this to the ID of the room the player should start in.
     */
    roomId: string;
    /**
     * List of rooms in the game.
     */
    rooms: Room[];
    /**
     * List of items in the player's inventory.
     */
    inventory?: Item[];
    /**
     * List of characters in the game.
     */
    characters?: Character[];
    /**
     * *Developer-only property*.
     */
    conversant?: Character;
    /**
     * *Developer-only property*.
     */
    conversation?: Topic[];
    /**
     * *Custom property*.
     */
    [key: string]: unknown;
}

interface GameDiskFactory {
    (): GameDiskObject;
}