## swap.online
[![Build Status](https://travis-ci.org/swaponline/swap.react.svg?branch=master)](https://travis-ci.org/swaponline/swap.react)

Atomic swap cryptocurrency protocol. Live version here: https://swap.online. Atomic swap library at http://github.com/swaponline/swap.core.

![](https://graphs.waffle.io/swaponline/swap.react/throughput.svg)

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
 # Структура папок и файлов
 
 ```
#### github
    Шаблоны для issue, PR, и т.п.
#### bin
    Express сервер для сборки webpack
#### client
    Html, scss, шрифты приложения
#### config
    app-config для тестнета и мейннета
#### cypress
    e2e тесты
#### local_modules
    локальные зависимости которых нет в npm <br />

### shared
- сам проект
   - components (компоненты)
   - containers (контейнеры)
   - decorators (JS декораторы)
   - helpers (вспомогательные средства для работы)
  #### instances
   - установка swap.core
  #### pages
  - страницы в приложении
  #### redux
 - вся логика redux
   - actions
   - core
   - redusers
   - store
  #### routes
   - маршруты для переходов по страницам
   #### webpack
   - настройки для сборки webpack
   ##### rules
     правила сборки для webpack
   ##### utils
     различные дополнительные констаты для сборки

#### babelrc
    настройки для babel
#### eslintignore
    файлы которые не проверяет eslint
#### eslintrc.yml
    настройки eslint для travis
#### gitignore
    файлы которые не пушиться в git
#### stylelintrc
    настройки для styleLint
#### travis.yml
    конфиг для travis

```
