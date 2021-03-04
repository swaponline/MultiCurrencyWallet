export interface EventEmitterFactory {
  new(): EventEmitter;
}

export interface EventEmitter {
  addListener(event: string | symbol, listener: (...args: any[]) => void);
  on(event: string | symbol, listener: (...args: any[]) => void);
  once(event: string | symbol, listener: (...args: any[]) => void);
  removeListener(event: string | symbol, listener: (...args: any[]) => void);
  off(event: string | symbol, listener: (...args: any[]) => void);
  removeAllListeners(event?: string | symbol);
  setMaxListeners(n: number);
  getMaxListeners(): number;
  listeners(event: string | symbol): Function[]; // eslint-disable-line @typescript-eslint/ban-types
  rawListeners(event: string | symbol): Function[]; // eslint-disable-line @typescript-eslint/ban-types
  emit(event: string | symbol, ...args: any[]): boolean;
  listenerCount(event: string | symbol): number;
}
