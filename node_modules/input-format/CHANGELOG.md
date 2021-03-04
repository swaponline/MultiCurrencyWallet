0.3.2 / 26.12.2020
==================

  * [Renamed](https://gitlab.com/catamphetamine/input-format/-/issues/2) all filenames with spaces to camelCase.

0.3.0 / 15.03.2020
==================

  * Changed CDN bundle global variable names (`input-format` -> `InputFormat`, `FormattedInput` -> `InputFormat`).

  * Removed `ReactInput` export from the default export. Import from `/react` subpackage instead.

  * `ReactInput` uses React Hooks now.

0.2.0 / 17.01.2018
==================

  * Removed the exported `InputController` class. If you didn't use the exported `InputController` class before then there's no need to change anything and just upgrade to the latest version. Otherwise use `onChange`, `onPaste`, `onCut`, `onKeyDown` exported functions instead (this has been decided to be simpler).

0.1.4 / 07.02.2017
==================

  * Added `.focus()` instance method

0.1.3 / 25.01.2017
==================

  * Fixed `onBlur`

0.1.0 / 12.12.2016
==================

  * Initial release