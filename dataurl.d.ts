declare module "dataurl" {
    export interface Config {
        data: string | Buffer;
        mimetype: string;
        charset?: string;
        encoded?: string;
    }

    export function convert(configuration: Config): string;
}

// declare module "canvas.js" {


//     export function setup(): void;
//     export function resize(): void;
//     export function stop(): void;
// }


declare module NodeJS {
    interface Global {
        questQueue: any,
        questUserData: string;
        secondaryQueue: any;

    }
}