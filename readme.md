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

A fork of the HTML-based text adventure game engine "[text-engine](https://github.com/okaybenji/text-engine)" by okaybenji, with the aim to migrate the project to [TypeScript](https://www.typescriptlang.org/).

### Motivation and Goal
Simply put, I prefer TypeScript over JavaScript. The primary vision is to migrate text-engine so that users have easy access to documentation trough [TSdoc](https://tsdoc.org/), i.e, within their IDE. 

### Installation and Building
Because the project now uses TypeScript, you will have to compile your files into JavaScript before you can run them. You can do this by installing dependencies with `npm install`, then run `npm run build` to compile the files. A `dist` folder will be created with all the compiled files ready to go.

For development, you can run `npm run dev` to watch for changes and compile them automatically. This is useful when making your game disks so you don't have to manually compile every time you make a change.

### How do I use it?
This project is meant only as a migration, meaning the original documentation still should be valid. In order to avoid uneeded redundency, I'll link to the original documentation instead, which can be found [here](https://github.com/okaybenji/text-engine#disks). 

### Some notes
* You should either apply the `GameDiskFactory` (v3) or `GameDiskObject` (v2) type to your disk object. For example: `const demoDisk: GameDiskFactory = () => ({})` or `const demoDisk: GameDiskObject = {}`. See `game-disks` folder for examples.
* Linting is disabled for all files in the `game-disks` folder.
* Altough I initially wanted to compile everything using the `strict` flag in `tsconfig.json`, it turns out theres probably no need since the code is pretty bug free anyway.