import { UnpackedData, PackedData } from './types';
import { UnpackedZoneData } from '@formatjs/ecma402-abstract';
export declare function pack(data: UnpackedData): PackedData;
export declare function unpack(data: PackedData): Record<string, UnpackedZoneData[]>;
//# sourceMappingURL=packer.d.ts.map