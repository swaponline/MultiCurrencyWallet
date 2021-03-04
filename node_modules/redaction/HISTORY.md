## 5.0.0

  * remove immutable version

## 4.5.0 (2019-03-27)

  * add `rootKey` to wrapReducer, which contains name of reducer's node

## 4.4.0 (2019-01-14)

  * remove devTools and redux-thunk from default middleware

## 4.3.0 (2018-05-26)

  * add waitList functionality to dispatch reducers only when store created. Now you don't need to wait when your store
    be created to call wrapReducers() - redaction doing this itself, all you need just to create store and wrap reducers
    with only one argument - your reducers object

## 4.2.1 (2018-05-25)

  * remove immutable from plain wrapReducers

## 4.2.0 (2018-02-08)

  * remove redux-batched-subscribe and react-dom. From now for batches feature need to add it by urself

## 4.1.7 (2018-02-07)

  * revert back redux-batched-subscribe

## 4.1.6 (2018-02-07) FAILED

  * replace redux-batched-subscribe with redux-batched-updates **(FAIL)**

## 4.1.5 (2017-12-13)

  * remove dispatch from connect 

## 4.1.4 (2017-12-03)

  * fix passing condition to convert empty variables, add tests to check it

## 4.1.3 (2017-12-03)

  * fix immutable List converting, add tests to check it

## 4.1.2 (2017-12-03)

  * Optimize converting speed from immutable

## 4.1.1 (2017-12-03)

  * add jest tests for immutable and plain connect methods combination with immutable store 
  * update lib connect wrapper to prevent saving resolveStoreProps method to sharable memory variable  

## 4.1.0 (2017-11-29)

  * add functionality to convert all immutable data in plain connect
  * remove second param from connect method, so there is just two params in connect method:
    ```
    connect(storeProps, options)
    ```

## 4.0.7 (2017-11-29)

  * Add condition to plain connect method to convert immutable result to plain js 

## 4.0.6 (2017-08-29)

  * Replace ES6 exports in root immutable.js with ES5

## 4.0.5 (2017-08-29)

  * Update export format to work with webpack imports resolving

## 4.0.4 (2017-08-19)

  * Update export format to work with webpack imports resolving

## 4.0.3 (2017-04-30)

  * Rework module - split to plain and immutable versions
  * Update examples for plain and immutable
  * Update Readme

## 3.3.4 (2017-04-06)

  * Move Immutable PropTypes to separate key `immutable`

## 3.3.3 (2017-04-06)

  * Improve `connect` method. Add option to call it as `react-redux` does. Add info about options of call to README.md

## 3.3.2 (2017-04-01)

  * Add `type` property to reducer wrappers. For example it can be used in redux-saga

## 3.3.1 (2017-04-01)

  * Add returning dispatch in connect method
  * Add redux-auth-wrapper example

## 3.3.0 (2017-03-30)

  * Fix combining reducers, change logic of usage in createStore. Beware
  * Update todos example
  * Add redux-form example

## 3.2.0 (2017-03-29)

  * Add connect method to link state to components
  * Add immutable react PropTypes

## 3.1.0 (2017-03-29)

  * Add Immutable.js

## 3.0.0 (2016-12-20)

  * Completely rework redaction library - remove action creators, create reducer wrappers with closure dispatching.
  * Update Readme.md

## 2.2.0 (2016-12-19)

  * Code clean up. Last commit in 2.* version.

## 2.1.1, 2.1.2 (2016-12-18)

  * Fix errors

## 2.1.0 (2016-12-18)

  * Remove `modifyState` method. Remove `strategy` option from request params. Add functionality to configure requests.
