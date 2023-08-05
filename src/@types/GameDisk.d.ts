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
    onUse?: ({ }?) => void;
    onLook?: ({ }?) => void;
    onTake?: ({ }?) => void;
    isHidden?: boolean
    block?: string
    use?: string
}

type Character = {
    name: string | string[];
    roomId: string;
    desc?: string;
    topics?: string | string[];
    onTalk?: ({ }?) => void;
    onLook?: ({ }?) => void;
    chatLog?: string[];
    isHidden?: boolean
}

type Topic = {
    option: string;
    removeOnRead?: boolean;
    prereqs?: string[];
    keyword?: string
} & (
        { line: string; onSelected?: never } |
        { line?: never; onSelected: () => void } |
        { line: string; onSelected: () => void }
    );

type Room = {
    visits: number;
    id: string;
    name: string;
    desc: string;
    exits: {
        dir: string
        id: string
        block?: string
        isHidden?: boolean
    }[];
    img?: string;
    items?: Item[];
    onEnter?: ({ }?) => void;
    onLook?: ({ }?) => void;
}

interface GameDiskObject {
    roomId: string;
    rooms: Room[];
    inventory?: Item[];
    characters?: Character[];
    conversation?: Topic[];
    conversant?: Character;
}

interface GameDiskFactory {
    (): GameDiskObject;
}