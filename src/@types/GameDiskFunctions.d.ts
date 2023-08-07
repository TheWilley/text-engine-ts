/**
 * Print a line of text to the console. It takes up to two arguments:
 * @param line The text to be printed.
 * @param className *Optional*. The name of a CSS class to apply to the line. You can use this to style the text.
 */
type Println = (line: string | string[] | (() => string), className?: string) => void;
/**
 * Get a random item from an array. It takes one argument:
 * @param arr The array with the items to pick from.
 * @returns A random item from the array.
 */
type PickOne = <T>(arr: T[]) => T;
/**
 * Get a reference to a room by its ID. It takes one argument:
 * @param id The unique identifier for the room.
 * @returns A reference to the room, or undefined if no room with that ID exists.
 */
type GetRoom = (id: string) => Room | undefined;
/**
 * Move the player to particular room. It takes one argument:
 * @param id The unique identifier for the room.
 */
type EnterRoom = (id: string) => void;
/**
 * Get a reference to an exit by its direction name from a list of exits. It takes two argument:
 * @param dir The name of the exit's dir (direction) property, e.g. "north".
 * @param exits The list of exits to search. (Usually you would get a reference to a room and pass room.exits.)
 * @returns A reference to the exit, or undefined if no exit with that dir exists.
*/
type GetExit = (dir: string, exits: Exit[]) => Exit | undefined;
/**
 * Get a reference to a character. It takes up to two arguments:
 * @param name The character's name.
 * @param chars *Optional*. The array of characters to search. Defaults to searching all characters on the disk.
 * @returns A reference to the character, or undefined if no character with that name exists.
 */
type GetCharacter = (name: string, chars?: Character[]) => Character | undefined;
/**
 * Get an array containing references to each character in a particular room. It takes one argument:
 * @param roomId The unique identifier for the room.
 * @returns An array of references to the characters in the room.
 */
type GetCharactersInRoom = (roomId: string) => Character[];
/**
 * Get a reference to an item, first looking in inventory, then in the current room. It takes one argument:
 * @param name The name of the item.
 * @returns A reference to the item, or undefined if no item with that name exists.
 */
type GetItem = (name: string) => Item | undefined;
/**
 * Get a reference to an item in a particular room. It takes two arguments:
 * @param itemName The name of the item.
 * @param roomId The unique identifier for the room.
 * @returns A reference to the item, or undefined if no item with that name exists in the room.
 */
type GetItemInRoom = (itemName: string, roomId: string) => Item | undefined;
/**
 * Get a reference to an item in the player's inventory. It takes one argument:
 * @param name The name of the item.
 * @returns A reference to the item, or undefined if no item with that name exists in the inventory.
 */
type GetItemInInventory = (name: string) => Item | undefined;
