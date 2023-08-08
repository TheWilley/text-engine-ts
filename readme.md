```
   ████████ ███████ ██   ██ ████████               
      ██    ██       ██ ██     ██                  
      ██    █████     ███      ██     █████            
      ██    ██       ██ ██     ██                  
      ██    ███████ ██   ██    ██                  
                                                
███████ ███    ██  ██████  ██ ███    ██ ███████ 
██      ████   ██ ██       ██ ████   ██ ██      
█████   ██ ██  ██ ██   ███ ██ ██ ██  ██ █████     █████   
██      ██  ██ ██ ██    ██ ██ ██  ██ ██ ██      
███████ ██   ████  ██████  ██ ██   ████ ███████

           ████████ ████████
              ██    ██
              ██    ████████
              ██          ██
              ██    ████████
```

A fork of the HTML-based text adventure game engine "[text-engine](https://github.com/okaybenji/text-engine)", originally created by okaybenji, with the aim to migrate the project to [TypeScript](https://www.typescriptlang.org/).

### Motivation and Goal
Simply put, I prefer TypeScript over JavaScript. The primary vision is to migrate text-engine so that users have type-checks and easy access to documentation trough [TSDoc](https://tsdoc.org/), i.e, within their IDE. 

### Installation and Building
Because the project now uses TypeScript, you will have to compile your files into JavaScript before you can run them. You can do this by installing dependencies with `npm install`, then run `npm run build` to compile the files. A `dist` folder will be created with all the compiled files ready to go.

For development, you can run `npm run dev` to watch for changes and compile them automatically. This is useful when making your game disks so you don't have to manually compile every time you make a change.

## How do I use it?
This project is designed primarily for migration purposes, with the expectation that the original documentation will largely remain valid. To streamline and eliminate redundancy, I'll direct you to the original documentation available [here](https://github.com/okaybenji/text-engine#disks). There are a few differences however, which I'll detail below.

### Documentation
All propeties and functions will have a description, along with different types of *classifications*.

| Classification      | Description |
| ----------- | ----------- |
| *Required*      | This property **must** exist.       |
| *Optional*   | This property **may** exist.        |
| *Recommended* | It is **recommended** that this property exist. |

This is to make it easier for users to know which propeties to use or not use within the `GameDiskObject` or `GameDiskFactory`.

### Swapping disks
Instead of using the `.js` file extension, use the `.ts` extension when loading scripts inside `index.html`. When running `npm run build`, these will automtically be changed to `.js` extensions.

### Adding custom properties
You may encounter an error resembling  `Property 'x' does not exist on type 'unknown'` when trying to use custom properties, and *this is by design*. Any properties which are not already known by text-engine will be defined as unknown in order to force the user (you) to properly handle and type-check them. This design decision is to promote safe and explicit coding practices.

To resolve these errors, you can use [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) to dynamically extend the interface already in place. Take this disk for example:

```typescript
const testDisk: GameDiskFactory = () => ({
    roomId: 'start',
    rooms: [
        {
            id: 'garage',
            onEnter() {
                // Create todo items.
                disk.todo = [
                    { id: 0, desc: `Fix car` },
                    { id: 1, desc: `Clean garage` },
                    { id: 2, desc: `Take out trash` },
                ];

                // Sort by description.
                disk.todo.sort((a, b) => a.desc.localeCompare(b.desc)); // <-- Property 'sort' does not exist on type 'unknown'.ts(2339)

                // Print todo items.
                disk.todo.forEach(item => println(`• ${item.desc}`)); // <-- Property 'forEach' does not exist on type 'unknown'.ts(2339)

                println('You entered garage.');
            }
        }
    ]
});
```

You will get two errors here since the functions `sort` and `forEach` does not exist on type `unknown`. The disk uses a interface called `GameDiskObject`, and thus we need to extend is as such:

```typescript
// Added interface here
interface GameDiskObject {
    todo?: { id: number, desc: string }[];
}

const testDisk: GameDiskFactory = () => ({
    roomId: 'start',
    rooms: [
        {
            id: 'garage',
            onEnter() {
                // Create todo items.
                disk.todo = [
                    { id: 0, desc: `Fix car` },
                    { id: 1, desc: `Clean garage` },
                    { id: 2, desc: `Take out trash` },
                ];

                // Sort by description.
                disk.todo.sort((a, b) => a.desc.localeCompare(b.desc)); // <-- No error

                // Print todo items.
                disk.todo.forEach(item => println(`• ${item.desc}`)); // <-- No error

                println('You entered garage.');
            }
        }
    ]
});
```

Now no errors are thrown anymore, since we have declared the explicit type of `todo`. 

*OBS: It is recommended to add the `?` flag after properties if you have multiple disks in the `game-disks` folder so that other game disks won't throw errors because of missing properties*.

## Some notes
* You should either apply the `GameDiskFactory` (v3) or `GameDiskObject` (v2) type to your disk object. For example: `const demoDisk: GameDiskFactory = () => ({})` or `const demoDisk: GameDiskObject = {}`. See `game-disks` folder for examples.
* Linting is disabled for all files in the `game-disks` folder.
* Try to avoid the `any` type as it effectively yields this migration useless.  