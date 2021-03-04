interface IPlainObject {
    [key: string]: any;
}
export declare type TypeInput = string | boolean | number | IPlainObject | Array<string | boolean | number | IPlainObject>;
export declare type IData = IPlainObject | IPlainObject[];
export interface ITreeChanges {
    changed: (key?: string | number) => boolean;
    changedFrom: (key: string | number, previous: TypeInput, actual?: TypeInput) => boolean;
    changedTo: (key: string | number, actual: TypeInput) => boolean;
    increased: (key: string | number) => boolean;
    decreased: (key: string | number) => boolean;
}
export default function treeChanges(data: IData, nextData: IData): ITreeChanges;
export {};
