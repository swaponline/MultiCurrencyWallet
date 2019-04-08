## swap.online

Atomic swap cryptocurrency protocol. Live version here: https://swap.online. Atomic swap library at http://github.com/swaponline/swap.core.

![widg_enteramount](https://user-images.githubusercontent.com/2914674/55753139-48666900-5a52-11e9-8814-4b38b0372529.gif)

## Swap  React

### Install

1) Clone repository with submodules (swap.core)
```
git clone --recurse-submodules https://github.com/swaponline/swap.react.git
```

2) Do `npm i` <br />
```
cd swap.react
npm i
```

3) Do `git submodule update` in swap.react directory

4) For dev mode `npm run start`, for prod `npm run build`

```
npm run start
```

### HTML widget
1. npm run build:mainnet-widget {erc20contract} {name} {decimals} {tiker}

example:
```
npm run build:mainnet-widget 0x9E4AD79049282F942c1b4c9b418F0357A0637017 noxon 0 noxon
tar czf my-widget.tar.gz build-mainnet-widget
```
2. upoad to your domain (https://domain.com/build-mainnet-widget)
3. embed via iframe like 
```
<iframe src="build-mainnet-widget/index.html" border=0 style="botder:0;width:800px;height:700px"></iframe>
```
 
```
