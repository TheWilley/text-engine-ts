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

*If you decide to use this fork for creating games, you may of course turn of the strict flag in `tsconfig.json` if you prefer to code without it.*

### Installation
Because the project now uses TypeScript, you will have to compile your files into JavaScript before you can run them. You can do this by installing dependencies with `npm install`, then run `npm run build` to compile the files. 

For development, you can run `npm run dev` to watch for changes and compile them automatically. This is useful when making your game disks so you don't have to manually compile every time you make a change.

### How do I use it?
This project is meant only as a migration, meaning the original documentation still should be valid. In order to avoid uneeded redundency, I'll link to the original documentation instead, which can be found [here](https://github.com/okaybenji/text-engine#disks). 