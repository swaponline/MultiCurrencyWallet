# Atomic swaps

## Atomic swap protocol (simplified)

### `A` locks funds

- `A` generates `secret` and -(hashing)-> `secretHash`

- `A` funds `Acontract` with properties:

```
`Acontract` <~ (`Bsignature` + `secret`)
         *~> send funds to B
```

* Note: `A` cannot withdraw from `Acontract` - cannot create `Bsignature`

- `A` sends {`secretHash`, `AcontractAddress`} ~> `B`


### `B` locks funds

- `B` audits `Acontract` (stops if not OK)

- `B` funds `Bcontract` using `secretHash` with properties:

```
(`Asignature` + hash(`secret`) == `secretHash`) ~> `Bcontract`
                                  send funds to A <~*
```

* Note: `B` cannot withdraw from `Bcontract` - cannot create `Asignature`

-`B` sends {`BcontractAddress`} ~> `A`


### `A` withdraws from `Bcontract`

`A` {`secret`, `Asignature`} ~> `Bcontract`
               send funds to A <~*

* Note: This transaction reveals the `secret` to `B`


### `B` withdraws from `Acontract`,
                                    
        `Acontract` <~ {`secret`, `Bsignature`} `B`
                 *~> send funds to B

(swap finished)