/// <reference types="node" />
export class URLWithLegacySupport extends URL {
    constructor(url?: string, base?: string);
    path: string;
    auth: string | null;
    query: string | null;
    format(): string;
}
import { URLSearchParams } from "url";
import { format } from "url";
export const defaultBase: "http://localhost";
import { URL } from "url";
export { URLSearchParams, format };
//# sourceMappingURL=url.d.ts.map