/// <reference types="node" />
import { KeyValue } from '../../interfaces';
export declare function makeChecker(pubkeyTypes: number[]): (keyVal: KeyValue) => Buffer | undefined;
