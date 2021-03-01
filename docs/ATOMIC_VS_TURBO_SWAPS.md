# `Atomic swaps` vs `Turbo Swaps` comparison

## Atomic swap, simplified
```
Peer1 -> Script1 ->,
   '<- Script2 <- Peer2
```
More information [here](/docs/ATOMIC_SWAPS.md).


## Turbo swap, simplified
```
  Moderator
Peer1 ⇆ Peer2
```
More information [here](/docs/TURBO_SWAPS.md).


## Comparison

|                        | Atomic swaps | Turbo swaps |
|------------------------|--------------|-------------|
| **Scheme**             | Indirect - use smart contracts / scripts | Direct - 2 simple txs |
| **Decentralization**   | More decentralized | Less decentralized |
| **Permission**         | Permissionless | Requires whitelisted deposited marketmakers |
| **Cost**               | Expensive ([additional transactions](/docs/ATOMIC_SWAPS.md)) | The cheapest |
| **Speed**              | Slower ([additional steps](/docs/ATOMIC_SWAPS.md)) | Faster |
