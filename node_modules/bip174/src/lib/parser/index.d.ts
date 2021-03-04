import { PsbtGlobal, PsbtInput, PsbtOutput } from '../interfaces';
export * from './fromBuffer';
export * from './toBuffer';
export interface PsbtAttributes {
    globalMap: PsbtGlobal;
    inputs: PsbtInput[];
    outputs: PsbtOutput[];
}
