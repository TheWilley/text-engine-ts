/* eslint-disable no-empty-pattern */

/*
Global type defentions would be a bad idea here if this was a library, but per https://www.reddit.com/r/typescript/comments/126im5c/dts_files_on_a_ts_project/
it would be fine here since this is more of an app

Functions are not included since they are imported directly from index.ts
*/

type Item = {
    name: string | string[];
    desc?: string;
    isTakeable?: boolean;
    onUse?: (args: unknown) => void;
    onLook?: (args: unknown) => void;
    onTake?: (args: unknown) => void;
}

type Character = {
    name: string | string[];
    roomId: string;
    desc?: string;
    topics?: string | Topic[];
    onTalk?: () => void;
    onLook?: () => void;
}

type Topic = {
    option: string;
    removeOnRead?: boolean;
    prereqs?: string[];
    keyword?: string;
    line?: string;
    onSelected?: () => void;
}

type Room = {
    id: string;
    name: string;
    desc: string;
    exits: {
        dir: string | string[];
        id: string;
        block?: string;
    }[];
    img?: string;
    items?: Item[];
    onEnter?: () => void;
    onLook?: () => void;
}

interface GameDiskObject {
    roomId: string;
    rooms: Room[];
    inventory?: Item[];
    characters?: Character[];
}

interface GameDiskFactory {
    (): GameDiskObject;
}