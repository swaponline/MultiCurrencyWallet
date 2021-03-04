import { useEffect, useRef } from 'react';
import * as equal from 'fast-deep-equal';

import treeChanges from './index';
import { Data, KeyType, TreeChanges } from './types';

export default function useTreeChanges<T extends Data>(value: T) {
  const previousValue = useRef(value);
  const isEqual = equal(previousValue.current, value);
  const previousIsEqual = useRef(isEqual);
  const instance = useRef<TreeChanges<KeyType<T, typeof previousValue.current>>>(
    treeChanges(previousValue.current, value),
  );

  useEffect(() => {
    previousValue.current = value;
  });

  if (previousIsEqual.current !== isEqual || !isEqual) {
    previousIsEqual.current = isEqual;
    instance.current = treeChanges(previousValue.current, value);
  }

  return instance.current;
}
