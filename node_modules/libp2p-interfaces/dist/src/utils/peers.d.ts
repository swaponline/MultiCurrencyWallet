declare const _exports: {
    [n: number]: {
        id: string;
        privKey: string;
        pubKey: string;
    };
    length: number;
    toString(): string;
    toLocaleString(): string;
    pop(): {
        id: string;
        privKey: string;
        pubKey: string;
    } | undefined;
    push(...items: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]): number;
    concat(...items: ConcatArray<{
        id: string;
        privKey: string;
        pubKey: string;
    }>[]): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    concat(...items: ({
        id: string;
        privKey: string;
        pubKey: string;
    } | ConcatArray<{
        id: string;
        privKey: string;
        pubKey: string;
    }>)[]): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    join(separator?: string | undefined): string;
    reverse(): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    shift(): {
        id: string;
        privKey: string;
        pubKey: string;
    } | undefined;
    slice(start?: number | undefined, end?: number | undefined): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    sort(compareFn?: ((a: {
        id: string;
        privKey: string;
        pubKey: string;
    }, b: {
        id: string;
        privKey: string;
        pubKey: string;
    }) => number) | undefined): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    splice(start: number, deleteCount?: number | undefined): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    splice(start: number, deleteCount: number, ...items: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    unshift(...items: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]): number;
    indexOf(searchElement: {
        id: string;
        privKey: string;
        pubKey: string;
    }, fromIndex?: number | undefined): number;
    lastIndexOf(searchElement: {
        id: string;
        privKey: string;
        pubKey: string;
    }, fromIndex?: number | undefined): number;
    every<S extends {
        id: string;
        privKey: string;
        pubKey: string;
    }>(predicate: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => value is S, thisArg?: any): this is S[];
    every(predicate: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => unknown, thisArg?: any): boolean;
    some(predicate: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => unknown, thisArg?: any): boolean;
    forEach(callbackfn: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => void, thisArg?: any): void;
    map<U>(callbackfn: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => U, thisArg?: any): U[];
    filter<S_1 extends {
        id: string;
        privKey: string;
        pubKey: string;
    }>(predicate: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => value is S_1, thisArg?: any): S_1[];
    filter(predicate: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => unknown, thisArg?: any): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    reduce(callbackfn: (previousValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentIndex: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => {
        id: string;
        privKey: string;
        pubKey: string;
    }): {
        id: string;
        privKey: string;
        pubKey: string;
    };
    reduce(callbackfn: (previousValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentIndex: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => {
        id: string;
        privKey: string;
        pubKey: string;
    }, initialValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }): {
        id: string;
        privKey: string;
        pubKey: string;
    };
    reduce<U_1>(callbackfn: (previousValue: U_1, currentValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentIndex: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => U_1, initialValue: U_1): U_1;
    reduceRight(callbackfn: (previousValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentIndex: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => {
        id: string;
        privKey: string;
        pubKey: string;
    }): {
        id: string;
        privKey: string;
        pubKey: string;
    };
    reduceRight(callbackfn: (previousValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentIndex: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => {
        id: string;
        privKey: string;
        pubKey: string;
    }, initialValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }): {
        id: string;
        privKey: string;
        pubKey: string;
    };
    reduceRight<U_2>(callbackfn: (previousValue: U_2, currentValue: {
        id: string;
        privKey: string;
        pubKey: string;
    }, currentIndex: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => U_2, initialValue: U_2): U_2;
    find<S_2 extends {
        id: string;
        privKey: string;
        pubKey: string;
    }>(predicate: (this: void, value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, obj: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => value is S_2, thisArg?: any): S_2 | undefined;
    find(predicate: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, obj: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => unknown, thisArg?: any): {
        id: string;
        privKey: string;
        pubKey: string;
    } | undefined;
    findIndex(predicate: (value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, obj: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => unknown, thisArg?: any): number;
    fill(value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, start?: number | undefined, end?: number | undefined): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    copyWithin(target: number, start: number, end?: number | undefined): {
        id: string;
        privKey: string;
        pubKey: string;
    }[];
    [Symbol.iterator](): IterableIterator<{
        id: string;
        privKey: string;
        pubKey: string;
    }>;
    entries(): IterableIterator<[number, {
        id: string;
        privKey: string;
        pubKey: string;
    }]>;
    keys(): IterableIterator<number>;
    values(): IterableIterator<{
        id: string;
        privKey: string;
        pubKey: string;
    }>;
    [Symbol.unscopables](): {
        copyWithin: boolean;
        entries: boolean;
        fill: boolean;
        find: boolean;
        findIndex: boolean;
        keys: boolean;
        values: boolean;
    };
    includes(searchElement: {
        id: string;
        privKey: string;
        pubKey: string;
    }, fromIndex?: number | undefined): boolean;
    flatMap<U_3, This = undefined>(callback: (this: This, value: {
        id: string;
        privKey: string;
        pubKey: string;
    }, index: number, array: {
        id: string;
        privKey: string;
        pubKey: string;
    }[]) => U_3 | readonly U_3[], thisArg?: This | undefined): U_3[];
    flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[];
};
export = _exports;
//# sourceMappingURL=peers.d.ts.map