## swap.online

Atomic swap cryptocurrency protocol. Live version here: https://swap.online. Atomic swap library at http://github.com/swaponline/swap.core.

## Swap  React

### Install
a
[link on install](https://youtu.be/EX2TomioHiU)

1) Clone [swap.core](https://github.com/swaponline/swap.core) to same directory where `swap.react` is <br />
```
swap.core/...
swap.react/...
```

2) Do `npm i` <br />
```
cd swap.react
npm i
```

3) For dev mode `npm run start`, for prod `npm run build`

```
npm run start
```

 # Структура папок и файлов
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

