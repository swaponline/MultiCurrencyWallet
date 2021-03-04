declare namespace pushable {
  export interface Pushable<T> extends AsyncIterable<T> {
    push: (value: T) => this,
    end: (err?: Error) => this
  }

  export interface PushableV<T> extends AsyncIterable<T[]> {
    push: (value: T) => this,
    end: (err?: Error) => this
  }

  type Options = {
    onEnd?: (err?: Error) => void,
    writev?: false
  }

  type OptionsV = {
    onEnd?: (err?: Error) => void,
    writev: true
  }
}

declare function pushable<T> (options?: pushable.Options): pushable.Pushable<T>
declare function pushable<T> (options: pushable.OptionsV): pushable.PushableV<T>

export = pushable
