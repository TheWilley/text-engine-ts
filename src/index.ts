/* eslint-disable no-useless-escape */
// global properties, assigned with let for easy overriding by the user
let diskFactory: GameDiskFactory;
let disk: GameDiskObject;

// Node class
class TreeNode {
  public data: Room;
  public children: TreeNode[];

  constructor(data: Room) {
    this.data = data;
    this.children = [];
  }

  public add(data: Room) {
    this.children.push(new TreeNode(data));
  }

  public remove(data: Room) {
    this.children = this.children.filter((node) => {
      return node.data !== data;
    });
  }
}

// Tree class
class Tree {
  public root: TreeNode | null;
  constructor() {
    this.root = null;
  }

  traverseBF(fn: (node: TreeNode) => void) {
    const arr = [this.root];
    while (arr.length) {
      const node = arr.shift();

      if (node) {
        arr.push(...node.children);
        fn(node);
      }
    }
  }

  traverseDF(fn: (node: TreeNode) => void) {
    const arr = [this.root];
    while (arr.length) {
      const node = arr.shift();

      if (node) {
        arr.unshift(...node.children);
        fn(node);
      }
    }
  }
}

// store user input history
let inputs = [];
let inputsPos = 0;

// define list style
// eslint-disable-next-line prefer-const
let bullet = '•';

// queue output for improved performance
const printQueue = [];

// reference to the input element
const input = document.querySelector('#input') as HTMLInputElement;

// reference to the output element
const output = document.querySelector('#output') as HTMLDivElement;

// add any default values to the disk
// disk -> disk
const init = (disk) => {
  const initializedDisk = Object.assign({}, disk);
  initializedDisk.rooms = disk.rooms.map((room) => {
    // number of times a room has been visited
    room.visits = 0;
    return room;
  });

  if (!initializedDisk.inventory) {
    initializedDisk.inventory = [];
  }

  if (!initializedDisk.characters) {
    initializedDisk.characters = [];
  }

  initializedDisk.characters = initializedDisk.characters.map(char => {
    // player's conversation history with this character
    char.chatLog = [];
    return char;
  });

  return initializedDisk;
};

// register listeners for input events
// eslint-disable-next-line prefer-const
let setup = () => {
  input.addEventListener('keypress', (e: KeyboardEvent) => {
    const ENTER = 13;

    if (e.keyCode === ENTER) {
      applyInput();
    }
  });

  input.addEventListener('keydown', (e: KeyboardEvent) => {
    input.focus();

    const UP = 38;
    const DOWN = 40;
    const TAB = 9;

    if (e.keyCode === UP) {
      navigateHistory('prev');
    } else if (e.keyCode === DOWN) {
      navigateHistory('next');
    } else if (e.keyCode === TAB) {
      e.stopPropagation();
      e.preventDefault();
      autocomplete();
    }
  });

  input.addEventListener('focusout', () => {
    input.focus({ preventScroll: true });
  });
};

// store player input history
// (optionally accepts a name for the save)
// eslint-disable-next-line prefer-const
let save = (name = 'save') => {
  localStorage.setItem(name, JSON.stringify(inputs));
  const line = name.length ? `Game saved as "${name}".` : 'Game saved.';
  println(line);
};

// reapply inputs from saved game
// (optionally accepts a name for the save)
// eslint-disable-next-line prefer-const
let load = (name = 'save') => {
  const save = localStorage.getItem(name);

  if (!save) {
    println('Save file not found.');
    return;
  }

  // if the disk provided is an object rather than a factory function, the game state must be reset by reloading
  if (typeof diskFactory !== 'function' && inputs.length) {
    println('You cannot load this disk in the middle of the game. Please reload the browser, then run the **LOAD** command again.');
    return;
  }

  inputs = [];
  inputsPos = 0;
  loadDisk();

  applyInputs(save);

  const line = name.length ? `Game "${name}" was loaded.` : 'Game loaded.';
  println(line);
};

// export current game to disk (optionally accepts a filename)
// eslint-disable-next-line prefer-const
let exportSave = (name) => {
  const filename = `${name.length ? name : 'text-engine-save'}.txt`;
  saveFile(JSON.stringify(inputs), filename);
  println(`Game exported to "${filename}".`);
};

// import a previously exported game from disk
// eslint-disable-next-line prefer-const
let importSave = () => {
  // if the disk provided is an object rather than a factory function, the game state must be reset by reloading
  if (typeof diskFactory !== 'function' && inputs.length) {
    println('You cannot load this disk in the middle of the game. Please reload the browser, then run the **LOAD** command again.');
    return;
  }

  const input = openFile();
  input.onchange = () => {
    const fr = new FileReader();
    const file = input.files[0];

    // register file loaded callback
    fr.onload = () => {
      // load the game
      inputs = [];
      inputsPos = 0;
      loadDisk();
      applyInputs(fr.result);
      println(`Game "${file.name}" was loaded.`);
      input.remove();
    };

    // register error handling
    fr.onerror = (event) => {
      println(`An error occured loading ${file.name}. See console for more information.`);
      console.error(`Reader error: ${fr.error}
        Reader error event: ${event}`);
      input.remove();
    };

    // attempt to load the text from the selected file
    fr.readAsText(file);
  };
};

// saves text from memory to disk
// eslint-disable-next-line prefer-const
let saveFile = (content, filename) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

// creates input element to open file prompt (allows user to load exported game from disk)
// eslint-disable-next-line prefer-const
let openFile = () => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.click();

  return input;
};

// applies string representing an array of input strings (used for loading saved games)
// eslint-disable-next-line prefer-const
let applyInputs = (string) => {
  let ins = [];

  try {
    ins = JSON.parse(string);
  } catch (err) {
    println('An error occurred. See error console for more details.');
    console.error(`An error occurred while attempting to parse text-engine inputs.
      Inputs: ${string}
      Error: ${err}`);
    return;
  }

  while (ins.length) {
    applyInput(ins.shift());
  }
};

// list player inventory
// eslint-disable-next-line prefer-const
let inv = () => {
  const items = disk.inventory.filter(item => !item.isHidden);

  if (!items.length) {
    println('You don\'t have any items in your inventory.');
    return;
  }

  println('You have the following items in your inventory:');
  items.forEach(item => {
    println(`${bullet} ${getName(item.name)}`);
  });
};

// show room description
// eslint-disable-next-line prefer-const
let look = () => {
  const room = getRoom(disk.roomId);

  if (typeof room.onLook === 'function') {
    room.onLook({ disk, println });
  }

  println(room.desc);
};

// look in the passed way
// string -> nothing
// eslint-disable-next-line prefer-const
let lookThusly = (str) => println(`You look ${str}.`);

// look at the passed item or character
// array -> nothing
// eslint-disable-next-line prefer-const
let lookAt = (args) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, name] = args;
  const item = getItemInInventory(name) || getItemInRoom(name, disk.roomId);

  if (item) {
    // Look at an item.
    if (item.desc) {
      println(item.desc);
    } else {
      println('You don\'t notice anything remarkable about it.');
    }

    if (typeof (item.onLook) === 'function') {
      item.onLook({ disk, println, getRoom, enterRoom, item });
    }
  } else {
    const character = getCharacter(name, getCharactersInRoom(disk.roomId));
    if (character) {
      // Look at a character.
      if (character.desc) {
        println(character.desc);
      } else {
        println('You don\'t notice anything remarkable about them.');
      }

      if (typeof (character.onLook) === 'function') {
        character.onLook({ disk, println, getRoom, enterRoom, item });
      }
    } else {
      println('You don\'t see any such thing.');
    }
  }
};

// list available 
// eslint-disable-next-line prefer-const
let go = () => {
  const room = getRoom(disk.roomId);
  const exits = room.exits.filter(exit => !exit.isHidden);

  if (!exits) {
    println('There\'s nowhere to go.');
    return;
  }

  println('Where would you like to go? Available directions are:');
  exits.forEach((exit) => {
    const rm = getRoom(exit.id);

    if (!rm) {
      return;
    }

    const dir = getName(exit.dir).toUpperCase();
    // include room name if player has been there before
    const directionName = rm.visits > 0
      ? `${dir} - ${rm.name}`
      : dir;

    println(`${bullet} ${directionName}`);
  });
};

// find the exit with the passed direction in the given list
// string, array -> exit
/**
 * Get a reference to an exit by its direction name from a list of exits. It takes two argument:
 * @param dir The name of the exit's dir (direction) property, e.g. "north".
 * @param exits The list of exits to search. (Usually you would get a reference to a room and pass room.exits.)
 * @returns A reference to the exit, or undefined if no exit with that dir exists.
*/
// eslint-disable-next-line prefer-const
let getExit: GetExit = (dir, exits) => exits.find(exit =>
  Array.isArray(exit.dir)
    ? exit.dir.includes(dir)
    : exit.dir === dir
);

// shortcuts for cardinal directions
// (allows player to type e.g. 'go n')
// eslint-disable-next-line prefer-const
let shortcuts = {
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  ne: 'northeast',
  nw: 'northwest',
  se: 'southeast',
  sw: 'southwest',
};

// go the passed direction
// string -> nothing
// eslint-disable-next-line prefer-const
let goDir = (dir) => {
  const room = getRoom(disk.roomId);
  const exits = room.exits;

  if (!exits) {
    println('There\'s nowhere to go.');
    return;
  }

  const nextRoom = getExit(dir, exits);

  if (!nextRoom) {
    // check if the dir is a shortcut
    if (shortcuts[dir]) {
      goDir(shortcuts[dir]);
    } else {
      println('There is no exit in that direction.');
    }
    return;
  }

  if (nextRoom.block) {
    println(nextRoom.block);
    return;
  }

  enterRoom(nextRoom.id);
};

// shortcuts for cardinal directions
// (allows player to type just e.g. 'n')
/* eslint-disable prefer-const */
let n = () => goDir('north');
let s = () => goDir('south');
let e = () => goDir('east');
let w = () => goDir('west');
let ne = () => goDir('northeast');
let se = () => goDir('southeast');
let nw = () => goDir('northwest');
let sw = () => goDir('southwest');
/* eslint-enable prefer-const */

// if there is one character in the room, engage that character in conversation
// otherwise, list characters in the room
// eslint-disable-next-line prefer-const
let talk = () => {
  const characters = getCharactersInRoom(disk.roomId);

  // assume players wants to talk to the only character in the room
  if (characters.length === 1) {
    talkToOrAboutX('to', getName(characters[0].name));
    return;
  }

  // list characters in the room
  println('You can talk TO someone or ABOUT some topic.');
  chars();
};

// speak to someone or about some topic
// string, string -> nothing
// eslint-disable-next-line prefer-const
let talkToOrAboutX = (preposition, x) => {
  const room = getRoom(disk.roomId);

  if (preposition !== 'to' && preposition !== 'about') {
    println('You can talk TO someone or ABOUT some topic.');
    return;
  }

  const character =
    preposition === 'to' && getCharacter(x, getCharactersInRoom(room.id))
      ? getCharacter(x, getCharactersInRoom(room.id))
      : disk.conversant;
  let topics;

  // give the player a list of topics to choose from for the character
  const listTopics = () => {
    // capture reference to the current conversation
    disk.conversation = topics;

    if (topics.length) {
      const availableTopics = topics.filter(topic => topicIsAvailable(character, topic));

      if (availableTopics.length) {
        println('What would you like to discuss?');
        availableTopics.forEach(topic => println(`${bullet} ${topic.option ? topic.option : topic.keyword.toUpperCase()}`));
        println(`${bullet} NOTHING`);
      } else {
        // if character isn't handling onTalk, let the player know they are out of topics
        if (!character.onTalk) {
          println(`You have nothing to discuss with ${getName(character.name)} at this time.`);
        }
        endConversation();
      }
    } else if (Object.keys(topics).length) {
      println('Select a response:');
      Object.keys(topics).forEach(topic => println(`${bullet} ${topics[topic].option}`));
    } else {
      endConversation();
    }
  };

  if (preposition === 'to') {
    if (!getCharacter(x)) {
      println('There is no one here by that name.');
      return;
    }

    if (!getCharacter(getName(x), getCharactersInRoom(room.id))) {
      println('There is no one here by that name.');
      return;
    }

    if (!character.topics) {
      println(`You have nothing to discuss with ${getName(character.name)} at this time.`);
      return;
    }

    if (typeof (character.topics) === 'string') {
      println(character.topics);
      return;
    }

    if (typeof (character.onTalk) === 'function') {
      character.onTalk({ disk, println, getRoom, enterRoom, room, character });
    }

    topics = typeof character.topics === 'function'
      ? character.topics({ println, room })
      : character.topics;

    if (!topics.length && !Object.keys(topics).length) {
      println(`You have nothing to discuss with ${getName(character.name)} at this time.`);
      return;
    }

    // initialize the chat log if there isn't one yet
    character.chatLog = character.chatLog || [];
    disk.conversant = character;
    listTopics();
  } else if (preposition === 'about') {
    if (!disk.conversant) {
      println('You need to be in a conversation to talk about something.');
      return;
    }
    // I'm unsure if I got the correct type on conversant so I pass it as a string for now
    const character = eval(disk.conversant as unknown as string);
    if (getCharactersInRoom(room.id).includes(disk.conversant)) {
      const response = x.toLowerCase();
      if (response === 'nothing') {
        endConversation();
        println('You end the conversation.');
      } else if (disk.conversation && disk.conversation[response]) {
        disk.conversation[response].onSelected();
      } else {
        const topic = disk.conversation.length && conversationIncludesTopic(disk.conversation, response);
        const isAvailable = topic && topicIsAvailable(character, topic);
        if (isAvailable && typeof topic === 'object') {
          if (topic.line) {
            println(topic.line);
          }
          if (topic.onSelected) {
            topic.onSelected({ disk, println, getRoom, enterRoom, room, character });
          }
          // add the topic to the log
          character.chatLog.push(getKeywordFromTopic(topic));
        } else {
          println(`You talk about ${removePunctuation(x)}.`);
          println('Type the capitalized KEYWORD to select a topic.');
        }
      }

      // continue the conversation.
      if (disk.conversation) {
        topics = typeof character.topics === 'function'
          ? character.topics({ println, room })
          : character.topics;
        listTopics();
      }
    } else {
      println('That person is no longer available for conversation.');
      disk.conversant = undefined;
      disk.conversation = undefined;
    }
  }
};

// list takeable items in room
// eslint-disable-next-line prefer-const
let take = () => {
  const room = getRoom(disk.roomId);
  const items = (room.items || []).filter(item => item.isTakeable && !item.isHidden);

  if (!items.length) {
    println('There\'s nothing to take.');
    return;
  }

  println('The following items can be taken:');
  items.forEach(item => println(`${bullet} ${getName(item.name)}`));
};

// take the item with the given name
// string -> nothing
// eslint-disable-next-line prefer-const
let takeItem = (itemName) => {
  const room = getRoom(disk.roomId);
  const findItem = item => objectHasName(item, itemName);
  let itemIndex = room.items && room.items.findIndex(findItem);

  if (typeof itemIndex === 'number' && itemIndex > -1) {
    const item = room.items[itemIndex];
    if (item.isTakeable) {
      disk.inventory.push(item);
      room.items.splice(itemIndex, 1);

      if (typeof item.onTake === 'function') {
        item.onTake({ disk, println, room, getRoom, enterRoom, item });
      } else {
        println(`You took the ${getName(item.name)}.`);
      }
    } else {
      if (typeof item.onTake === 'function') {
        item.onTake({ disk, println, room, getRoom, enterRoom, item });
      } else {
        println(item.block || 'You can\'t take that.');
      }
    }
  } else {
    itemIndex = disk.inventory.findIndex(findItem);
    if (typeof itemIndex === 'number' && itemIndex > -1) {
      println('You already have that.');
    } else {
      println('You don\'t see any such thing.');
    }
  }
};

// list useable items in room and inventory
// eslint-disable-next-line prefer-const
let use = () => {
  const room = getRoom(disk.roomId);

  const useableItems = (room.items || [])
    .concat(disk.inventory)
    .filter(item => item.onUse && !item.isHidden);

  if (!useableItems.length) {
    println('There\'s nothing to use.');
    return;
  }

  println('The following items can be used:');
  useableItems.forEach((item) => {
    println(`${bullet} ${getName(item.name)}`);
  });
};

const map = () => {
  const convertPos = (dir: string, pos: { y: number, x: number }) => {
    // Check if the position is undefined
    // Not a very good solution as we can get duplicate positions
    if (!pos) {
      // Generate a random position to be either 1 or -1
      pos = { y: Math.random() > 0.5 ? 1 : -1, x: Math.random() > 0.5 ? 1 : -1 };
    }

    // Check if the direction is an array and find the first available direction
    const availableDirs = ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'];
    if (Array.isArray(dir)) {
      // Find the first available direction
      dir = dir.find(d => availableDirs.includes(d));
    }

    // Convert the direction to a position
    switch (dir) {
      case 'north':
        pos.y--;
        break;
      case 'south':
        pos.y++;
        break;
      case 'east':
        pos.x++;
        break;
      case 'west':
        pos.x--;
        break;
      case 'northeast':
        pos.y--;
        pos.x++;
        break;
      case 'northwest':
        pos.y--;
        pos.x--;
        break;
      case 'southeast':
        pos.y++;
        pos.x++;
        break;
      case 'southwest':
        pos.y++;
        pos.x--;
        break;
    }
    return pos;
  };

  // Create a adjacency list
  const getAdjacentList = () => {
    const adjacencyList = {};

    for (let i = 0; i < disk.rooms.length; i++) {
      const room = disk.rooms[i];
      if (!adjacencyList[room.id]) {
        adjacencyList[room.id] = [];
      }

      if (room.exits) {
        for (let j = 0; j < room.exits.length; j++) {
          const exit = room.exits[j];
          const nextRoom = getRoom(exit.id);
          if (nextRoom && !adjacencyList[room.id].includes(nextRoom.id)) {
            if (!adjacencyList[nextRoom.id]) {
              adjacencyList[nextRoom.id] = [];
            }
            adjacencyList[nextRoom.id].push({ room: room, dir: exit.dir, pos: { y: 0, x: 0 } });
          }
        }
      }
    }

    return adjacencyList;
  };

  const get2dmap = () => {
    const adjacencyList = getAdjacentList();
    const map = {};

    // Deep First Search (DFS) algorithm
    function dfs(node: { room: Room, dir: string, pos: { y: number, x: number } }, visited: Set<string>): void {
      if (!visited.has(node.room.id)) {

        visited.add(node.room.id);
        for (const neighbor of adjacencyList[node.room.id] || []) {
          const relativePos = { y: node.pos.y, x: node.pos.x };
          // Set relative position of neighbor
          neighbor.pos = convertPos(neighbor.dir, relativePos);
          map[neighbor.room.id] = neighbor.pos;

          dfs(neighbor, visited);
        }
      }
    }

    // Find first room with exits
    const startingNode = disk.rooms.find(room => room.exits && room.exits.length > 0);

    // Create a Set to store the visited nodes
    const visitedNodes = new Set<string>();

    // Start the DFS
    dfs({ room: startingNode, dir: null, pos: { y: 0, x: 0 } }, visitedNodes);

    return map;
  };

  console.log('Map:' + JSON.stringify(get2dmap(), null, 2));
};

// use the item with the given name
// string -> nothing
// eslint-disable-next-line prefer-const
let useItem = (itemName) => {
  const item = getItemInInventory(itemName) || getItemInRoom(itemName, disk.roomId);

  if (!item) {
    println('You don\'t have that.');
    return;
  }

  if (item.use) {
    console.warn('Warning: The "use" property for Items has been renamed to "onUse" and support for "use" has been deprecated in text-engine 2.0. Please update your disk, renaming any "use" methods to be called "onUse" instead.');

    item.onUse = item.use;
  }

  if (!item.onUse) {
    println('That item doesn\'t have a use.');
    return;
  }

  // use item and give it a reference to the game
  if (typeof item.onUse === 'string') {
    const use = eval(item.onUse);
    use({ disk, println, getRoom, enterRoom, item });
  } else if (typeof item.onUse === 'function') {
    item.onUse({ disk, println, getRoom, enterRoom, item });
  }
};

// list items in room
// eslint-disable-next-line prefer-const
let items = () => {
  const room = getRoom(disk.roomId);
  const items = (room.items || []).filter(item => !item.isHidden);

  if (!items.length) {
    println('There\'s nothing here.');
    return;
  }

  println('You see the following:');
  items
    .forEach(item => println(`${bullet} ${getName(item.name)}`));
};

// list characters in room
// eslint-disable-next-line prefer-const
let chars = () => {
  const room = getRoom(disk.roomId);
  const chars = getCharactersInRoom(room.id).filter(char => !char.isHidden);

  if (!chars.length) {
    println('There\'s no one here.');
    return;
  }

  println('You see the following:');
  chars
    .forEach(char => println(`${bullet} ${getName(char.name)}`));
};

// display help menu
// eslint-disable-next-line prefer-const
let help = () => {
  const instructions = `The following commands are available:
    LOOK:           'look at key'
    TAKE:           'take book'
    GO:             'go north'
    USE:            'use door'
    TALK:           'talk to mary'
    ITEMS:          list items in the room
    CHARS:          list characters in the room
    INV:            list inventory items
    SAVE/LOAD:      save current game, or load a saved game (in memory)
    IMPORT/EXPORT:  save current game, or load a saved game (on disk)
    HELP:   this help menu
  `;
  println(instructions);
};

// handle say command with no args
// eslint-disable-next-line prefer-const
let say = () => println(['Say what?', 'You don\'t say.']);

// say the passed string
// string -> nothing
// eslint-disable-next-line prefer-const
let sayString = (str) => println(`You say ${removePunctuation(str)}.`);

// retrieve user input (remove whitespace at beginning or end)
// nothing -> string
const getInput = () => input.value.trim();

// objects with methods for handling commands
// the array should be ordered by increasing number of accepted parameters
// e.g. index 0 means no parameters ("help"), index 1 means 1 parameter ("go north"), etc.
// the methods should be named after the command (the first argument, e.g. "help" or "go")
// any command accepting multiple parameters should take in a single array of parameters
// if the user has entered more arguments than the highest number you've defined here, we'll use the last set
// eslint-disable-next-line prefer-const
let commands = [
  // no arguments (e.g. "help", "chars", "inv")
  {
    inv,
    i: inv, // shortcut for inventory
    inventory: inv,
    look,
    l: look, // shortcut for look
    go,
    n,
    s,
    e,
    w,
    ne,
    se,
    sw,
    nw,
    talk,
    t: talk, // shortcut for talk
    take,
    get: take,
    items,
    use,
    chars,
    characters: chars,
    help,
    say,
    save,
    load,
    restore: load,
    export: exportSave,
    import: importSave,
    map: map,
  },
  // one argument (e.g. "go north", "take book")
  {
    look: lookThusly,
    go: goDir,
    take: takeItem,
    get: takeItem,
    use: useItem,
    say: sayString,
    save: x => save(x),
    load: x => load(x),
    restore: x => load(x),
    x: x => lookAt([null, x]), // IF standard shortcut for look at
    t: x => talkToOrAboutX('to', x), // IF standard shortcut for talk
    export: exportSave,
    import: importSave, // (ignores the argument)
  },
  // two+ arguments (e.g. "look at key", "talk to mary")
  {
    look: lookAt,
    say(args) {
      const str = args.reduce((cur, acc) => cur + ' ' + acc, '');
      sayString(str);
    },
    talk: args => talkToOrAboutX(args[0], args[1]),
    x: args => lookAt([null, ...args]),
  },
];

// process user input & update game state (bulk of the engine)
// accepts optional string input; otherwise grabs it from the input element
const applyInput = (input?) => {
  const isNotSaveLoad = (cmd) => !cmd.toLowerCase().startsWith('save')
    && !cmd.toLowerCase().startsWith('load')
    && !cmd.toLowerCase().startsWith('export')
    && !cmd.toLowerCase().startsWith('import');

  input = input || getInput();
  inputs.push(input);
  inputs = inputs.filter(isNotSaveLoad);
  inputsPos = inputs.length;
  println(`> ${input}`);

  const val = input.toLowerCase();
  setInput(''); // reset input field

  const exec = (cmd, arg) => {
    if (cmd) {
      cmd(arg);
    } else if (disk.conversation) {
      println('Type the capitalized KEYWORD to select a topic.');
    } else {
      println('Sorry, I didn\'t understand your input. For a list of available commands, type HELP.');
    }
  };

  let values = val.split(' ');

  // remove articles
  // (except for the say command, which prints back what the user said)
  // (and except for meta commands to allow save names such as 'a')
  if (values[0] !== 'say' && isNotSaveLoad(values[0])) {
    values = values.filter(arg => arg !== 'a' && arg !== 'an' && arg != 'the');
  }

  const [command, ...args] = values;
  const room = getRoom(disk.roomId);

  if (args.length === 1) {
    exec(commands[1][command], args[0]);
  } else if (command === 'take' && args.length) {
    // support for taking items with spaces in the names
    // (just tries to match on the first word)
    takeItem(args[0]);
  } else if (command === 'use' && args.length) {
    // support for using items with spaces in the names
    // (just tries to match on the first word)
    useItem(args[0]);
  } else if (args.length >= commands.length) {
    exec(commands[commands.length - 1][command], args);
  } else if (room.exits && getExit(command, room.exits)) {
    // handle shorthand direction command, e.g. "EAST" instead of "GO EAST"
    goDir(command);
  } else if (disk.conversation && (disk.conversation[command] || conversationIncludesTopic(disk.conversation, command))) {
    talkToOrAboutX('about', command);
  } else {
    exec(commands[args.length][command], args);
  }
};

// allows wrapping text in special characters so println can convert them to HTML tags
// string, string, string -> string
const addStyleTags = (str, char, tagName) => {
  let odd = true;
  while (str.includes(char)) {
    const tag = odd ? `<${tagName}>` : `</${tagName}>`;
    str = str.replace(char, tag);
    odd = !odd;
  }

  return str;
};

// overwrite user input
// string -> nothing
const setInput = (str) => {
  input.value = str;
  // on the next frame, move the cursor to the end of the line
  setTimeout(() => {
    input.selectionStart = input.selectionEnd = input.value.length;
  });
};

// render output, with optional class
// (string | array | fn -> string) -> nothing
/**
 * Print a line of text to the console. It takes up to two arguments:
 * @param line The text to be printed.
 * @param className *Optional*. The name of a CSS class to apply to the line. You can use this to style the text.
 */
const println: Println = (line?, className?) => {
  // bail if string is null or undefined
  if (!line) {
    return;
  }

  let str =
    // if this is an array of lines, pick one at random
    Array.isArray(line) ? pickOne(line)
      // if this is a method returning a string, evaluate it
      : typeof line === 'function' ? line()
        // otherwise, line should be a string
        : line;

  const newLine = document.createElement('div');

  if (className) {
    newLine.classList.add(className);
  }

  // add a class for styling prior user input
  if (line[0] === '>') {
    newLine.classList.add('user');
  }

  // support for markdown-like bold, italic, underline & strikethrough tags
  if (className !== 'img') {
    str = addStyleTags(str, '__', 'u');
    str = addStyleTags(str, '**', 'b');
    str = addStyleTags(str, '*', 'i');
    str = addStyleTags(str, '~~', 'strike');
  }

  // maintain line breaks
  while (str.includes('\n')) {
    str = str.replace('\n', '<br>');
  }

  newLine.innerHTML = str;

  // push into the queue to print to the DOM
  printQueue.push(newLine);
};

// predict what the user is trying to type
const autocomplete = () => {
  const room = getRoom(disk.roomId);
  const words = input.value.toLowerCase().trim().split(/\s+/);
  const wordsSansStub = words.slice(0, words.length - 1);
  const itemNames = (room.items || []).concat(disk.inventory).map(item => item.name);

  const stub = words[words.length - 1];
  let options;

  if (words.length === 1) {
    // get the list of options from the commands array
    // (exclude one-character commands from auto-completion)
    const allCommands = commands
      .reduce((acc, cur) => acc.concat(Object.keys(cur)), [])
      .filter(cmd => cmd.length > 1);

    options = [...new Set(allCommands)];
    if (disk.conversation) {
      options = Array.isArray(disk.conversation)
        ? options.concat(disk.conversation.map(getKeywordFromTopic))
        : Object.keys(disk.conversation);
      options.push('nothing');
    }
  } else if (words.length === 2) {
    const optionMap = {
      talk: ['to', 'about'],
      take: itemNames,
      use: itemNames,
      go: (room.exits || []).map(exit => exit.dir),
      look: ['at'],
    };
    options = optionMap[words[0]];
  } else if (words.length === 3) {
    const characterNames = (getCharactersInRoom(room.id) || []).map(character => character.name);
    const optionMap = {
      to: characterNames,
      at: characterNames.concat(itemNames),
    };
    options = (optionMap[words[1]] || []).flat().map(string => string.toLowerCase());
  }

  const stubRegex = new RegExp(`^${stub}`);
  const matches = (options || []).flat().filter(option => option.match(stubRegex));

  if (!matches.length) {
    return;
  }

  if (matches.length > 1) {
    const longestCommonStartingSubstring = (arr1) => {
      const arr = arr1.concat().sort();
      const a1 = arr[0];
      const a2 = arr[arr.length - 1];
      const L = a1.length;
      let i = 0;
      while (i < L && a1.charAt(i) === a2.charAt(i)) {
        i++;
      }
      return a1.substring(0, i);
    };

    input.value = [...wordsSansStub, longestCommonStartingSubstring(matches)].join(' ');
  } else {
    input.value = [...wordsSansStub, matches[0]].join(' ');
  }
};

// select previously entered commands
// string -> nothing
const navigateHistory = (dir) => {
  if (dir === 'prev') {
    inputsPos--;
    if (inputsPos < 0) {
      inputsPos = 0;
    }
  } else if (dir === 'next') {
    inputsPos++;
    if (inputsPos > inputs.length) {
      inputsPos = inputs.length;
    }
  }

  setInput(inputs[inputsPos] || '');
};

// get random array element
// array -> any
/**
 * Get a random item from an array. It takes one argument:
 * @param arr The array with the items to pick from.
 * @returns A random item from the array.
 */
const pickOne: PickOne = arr => arr[Math.floor(Math.random() * arr.length)];

// return the first name if it's an array, or the only name
// string | array -> string
const getName = name => typeof name === 'object' ? name[0] : name;

// retrieve room by its ID
// string -> room
/**
 * Get a reference to a room by its ID. It takes one argument:
 * @param id The unique identifier for the room.
 * @returns A reference to the room, or undefined if no room with that ID exists.
 */
const getRoom: GetRoom = (id) => disk.rooms.find(room => room.id === id);

// remove punctuation marks from a string
// string -> string
const removePunctuation = str => str.replace(/[.,\/#?!$%\^&\*;:{}=\_`~()]/g, '');

// remove extra whitespace from a string
// string -> string
const removeExtraSpaces = str => str.replace(/\s{2,}/g, ' ');

// move the player into room with passed ID
// string -> nothing
/**
 * Move the player to particular room. It takes one argument:
 * @param id The unique identifier for the room.
 */
const enterRoom: EnterRoom = (id) => {
  const room = getRoom(id);

  if (!room) {
    println('That exit doesn\'t seem to go anywhere.');
    return;
  }

  println(room.img, 'img');

  if (room.name) {
    println(`${getName(room.name)}`, 'room-name');
  }

  if (room.visits === 0) {
    println(room.desc);
  }

  room.visits++;

  disk.roomId = id;

  if (typeof room.onEnter === 'function') {
    room.onEnter({ disk, println, getRoom, enterRoom });
  }

  // reset any active conversation
  delete disk.conversation;
  delete disk.conversant;
};

// determine whether the object has the passed name
// item | character, string -> bool
const objectHasName = (obj, name) => {
  const compareNames = n => n.toLowerCase().includes(name.toLowerCase());

  return Array.isArray(obj.name)
    ? obj.name.find(compareNames)
    : compareNames(obj.name);
};

// get a list of all characters in the passed room
// string -> characters
/**
 * Get an array containing references to each character in a particular room. It takes one argument:
 * @param roomId The unique identifier for the room.
 * @returns An array of references to the characters in the room.
 */
const getCharactersInRoom: GetCharactersInRoom = (roomId) => disk.characters.filter(c => c.roomId === roomId);

// get a character by name from a list of characters
// string, characters -> character
/**
 * Get a reference to a character. It takes up to two arguments:
 * @param name The character's name.
 * @param chars *Optional*. The array of characters to search. Defaults to searching all characters on the disk.
 * @returns A reference to the character, or undefined if no character with that name exists.
 */
const getCharacter: GetCharacter = (name, chars = disk.characters) => chars.find(char => objectHasName(char, name));

// get item by name from room with ID
// string, string -> item
/**
 * Get a reference to an item in a particular room. It takes two arguments:
 * @param itemName The name of the item.
 * @param roomId The unique identifier for the room.
 * @returns A reference to the item, or undefined if no item with that name exists in the room.
 */
const getItemInRoom: GetItemInRoom = (itemName, roomId) => {
  const room = getRoom(roomId);

  return room.items && room.items.find(item => objectHasName(item, itemName));
};

// get item by name from inventory
// string -> item
/**
 * Get a reference to an item in the player's inventory. It takes one argument:
 * @param name The name of the item.
 * @returns A reference to the item, or undefined if no item with that name exists in the inventory.
 */
const getItemInInventory: GetItemInInventory = (name) => disk.inventory.find(item => objectHasName(item, name));

// get item by name
// string -> item
/**
 * Get a reference to an item, first looking in inventory, then in the current room. It takes one argument:
 * @param name The name of the item.
 * @returns A reference to the item, or undefined if no item with that name exists.
 */
// eslint-disable-next-line
const getItem: GetItem = (name) => getItemInInventory(name) || getItemInRoom(name, disk.roomId);

// retrieves a keyword from a topic
// topic -> string
const getKeywordFromTopic = (topic) => {
  if (topic.keyword) {
    return topic.keyword;
  }

  // find the keyword in the option (the word in all caps)
  const keyword = removeExtraSpaces(removePunctuation(topic.option))
    // separate words by spaces
    .split(' ')
    // find the word that is in uppercase
    // (must be at least 2 characters long)
    .find(w => w.length > 1 && w.toUpperCase() === w)
    .toLowerCase();

  return keyword;
};

// determine whether the passed conversation includes a topic with the passed keyword
// conversation, string -> boolean
const conversationIncludesTopic = (conversation, keyword) => {
  // NOTHING is always an option
  if (keyword === 'nothing') {
    return true;
  }

  if (Array.isArray(disk.conversation)) {
    return disk.conversation.find(t => getKeywordFromTopic(t) === keyword);
  }

  return disk.conversation[keyword];
};

// determine whether the passed topic is available for discussion
// character, topic -> boolean
const topicIsAvailable = (character, topic) => {
  // topic has no prerequisites, or its prerequisites have been met
  const prereqsOk = !topic.prereqs || topic.prereqs.every(keyword => character.chatLog.includes(keyword));
  // topic is not removed after read, or it hasn't been read yet
  const readOk = !topic.removeOnRead || !character.chatLog.includes(getKeywordFromTopic(topic));

  return prereqsOk && readOk;
};

// end the current conversation
const endConversation = () => {
  disk.conversant = undefined;
  disk.conversation = undefined;
};

// load the passed disk and start the game
// disk -> nothing
const loadDisk = (uninitializedDisk?) => {
  if (uninitializedDisk) {
    diskFactory = uninitializedDisk;
    // start listening for user input
    setup();
  }

  // initialize the disk
  // (although we expect the disk to be a factory function, we still support the old object format)
  disk = init(typeof diskFactory === 'function' ? diskFactory() : diskFactory);

  // start the game
  enterRoom(disk.roomId);

  // focus on the input
  input.focus();
};

// append any pending lines to the DOM each frame
const printText = () => {
  if (printQueue.length) {
    while (printQueue.length) {
      output.appendChild(printQueue.shift());
    }

    // scroll to the most recent output at the bottom of the page
    window.scrollTo(0, document.body.scrollHeight);
  }

  requestAnimationFrame(printText);
};

requestAnimationFrame(printText);

// npm support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = loadDisk;
}
