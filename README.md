## swap.online

Atomic swap cryptocurrency protocol. Live version here: https://swap.online. Atomic swap library at http://github.com/swaponline/swap.core.

<img src="https://user-images.githubusercontent.com/2914674/55753139-48666900-5a52-11e9-8814-4b38b0372529.gif" data-canonical-src="https://wiki.swap.online/widg_2.gif" width="400"  />

## Swap  React

### Install

#### Eng

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
   > If you need to deploy it on your own origin - run build like: `npm run build:mainnet https://your.cool.origin/`

```
npm run start
```

#### Ru

1) Склонируйте репозиторий со вложенными модулями (swap.core)
```
git clone --recurse-submodules https://github.com/swaponline/swap.react.git
```

2) Установите зависимости с помощью пакетного менеджера `npm i` <br />
```
cd swap.react
npm i
```

3) Обновите вложенные модули с помощью `git submodule update` в папке swap.react

4) Чтобы начать разработку - запустите `npm run start`, для сборки продуктовой версии - `npm run build`
   > Если нужно поместить сборку на ваш собственный домен - запустите сборку с указанием вашего домена: `npm run build:mainnet https://your.cool.origin/`

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
 
## Как менять картинки и цвета

### 1. как помененять логотип
swap.react/shared/components/Logo
* в папке `images` перенести свои свг файлы
* в файле `Logo.js` изменить alt на свой  

    ```const imgNode = React.createElement('img', {
      styleName: !withLink && 'logo',
      src: isColored ? coloredLogoImage : logoImage,
      alt: 'swap.online logo', // измененить на свой
    })
    ```
* для изменения цвета иконки валюты нужно перейти в `swap.react/shared/components/ui/CurrencyIcon/images`
    заменить на свою иконку, важно чтоб имя свг файла соответствовало имени валюты
* для изменения свг файлов в слайдере валют, нужно изменить свг в файл в `/swap.react/shared/pages/PartialClosure/CurrencySlider/images`

### 2. как поменять ссылки на соц сети
    `swap.react/shared/helpers/links.js`
* в папке `links` меняем ссылки на свои

### 3.  как поменять текст
   Для предотвращения любых конфликтов в будущем 
   * находим в тексе интересующий нас текст, например: 
        ``` <FormattedMessage id="Row313" defaultMessage="Deposit" />  ```

   * в папке `swap.react/shared/localisation`
     В зависимости от интересующего нас языка (если английский то в файле en) 
     находим текст с интересующим нас id ("Row313")

      ```
        {
            "id": "Row313",
            "message": "Deposit",
            "files": [
            "shared/pages/Currency/Currency.js",
            "shared/pages/CurrencyWallet/CurrencyWallet.js",
            "shared/pages/OldWallet/Row/Row.js"
            ]
        },
      ```

   * меняем текст в `message`

### 4. как добавить токен

   * переходим в `swap.react/config/mainnet/erc20.js`
   * добавляем все необходимые поля (адрес, количество знаков после запятой, название)
   * переходим в `swap.react/swap.core/src/swap.app/constants/COINS.js` добавляем тот же токен

### 5. Добавление кошелька

* если вы хотите, чтоб валюту нельзя было доабвить в кошелек, то 
в `shared/redux/reducers/currencies.js` в объекте описывающем валюту ставим `addAssets: false,` или не ставим вовсе, 
если хотите, чтоб можно было добавить то ставим тот же ключ со значением `true`
все токены по дефолту добавляются в этот список




 


