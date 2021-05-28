declare module "dataurl" {
    export interface Config {
        data: string | Buffer;
        mimetype: string;
        charset?: string;
        encoded?: string;
    }

    export function convert(configuration: Config): string;
}


declare module NodeJS  {
    interface Global {
        questQueue: any,
        questUserData: string
        
    }
}