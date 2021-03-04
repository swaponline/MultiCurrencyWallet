declare const _exports: {
    default: typeof fetch;
    Headers: {
        new (init?: Headers | string[][] | Record<string, string> | undefined): Headers;
        prototype: Headers;
    };
    Request: {
        new (input: RequestInfo, init?: RequestInit | undefined): Request;
        prototype: Request;
    };
    Response: {
        new (body?: string | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array> | null | undefined, init?: ResponseInit | undefined): Response;
        prototype: Response;
        error(): Response;
        redirect(url: string, status?: number | undefined): Response;
    };
} | {
    default: typeof import("node-fetch").default;
    Headers: typeof import("node-fetch").Headers;
    Request: typeof import("node-fetch").Request;
    Response: typeof import("node-fetch").Response;
};
export = _exports;
//# sourceMappingURL=index.d.ts.map