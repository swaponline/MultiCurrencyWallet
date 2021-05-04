//    DRAFT


/* Use BigInt?
// use @babel/plugin-syntax-bigint

type DerivedUnit = BigInteger

enum UnitType {
  Int = 'Int',
  Float = 'Float'
}

type Balance = {
  smaller:
  derived: DerivedUnit
}
*/

import BigNumber from 'bignumber.js'

type Amount = {
  value: BigNumber
  unit: Unit
}

enum UnitType {
  Smaller = 'Smaller', // int?
  Derived = 'Derived', // float?
}

type Unit = {
  unitType: UnitType,
  factor: number
}

type Balance = {
  unconfirmed: Amount
  free: Amount
  locked: Amount
}


type Coin = {
  title: string,
  unit: any,
  getBalance(): Balance,
  getMinerFee(): Amount,
}

const amount = (value: number, unit: Unit | Coin): Amount => {
  // use overload
  return {
    value: new BigNumber(value), // BigNumber overload
    //@ts-ignore: strictNullChecks
    unit: null// ...
  }
}


// declare coins

const BTC: Coin = {
  title: 'Bitcoin',
  //ticker: 'BTC',
  unit: {
    'sat': {
      unitType: UnitType.Smaller,
    },
    'BTC': {
      unitType: UnitType.Derived,
      factor: 1e8,
    }
  },
  getBalance() { // fetch...
    return {
      unconfirmed: amount(0, BTC),
      free: amount(0.123, BTC),
      locked: amount(0, BTC)
    }
  },
  getMinerFee() { // fetch...
    return amount(15000, BTC.unit.sat)
  }
}

const ETH: Coin = {
  title: 'Ethereum',
  //ticker: 'ETH',
  unit: {
    'wei': {
      unitType: UnitType.Smaller,
    },
    'Gwei': {
      unitType: UnitType.Derived,
      factor: 1e9
    },
    'ETH': {
      unitType: UnitType.Derived,
      factor: 1e18
    }
  },
  getBalance() { // fetch...
    return {
      unconfirmed: amount(0, ETH),
      free: amount(1.23, ETH),
      locked: amount(0, ETH)
    }
  },
  getMinerFee() { // fetch...
    return amount(110, ETH.unit.Gwei)
  }
}

const GRM: Coin = {
  title: 'Gram',
  unit: {
    'nano': {
      unitType: UnitType.Smaller,
    },
    'Gram': {
      unitType: UnitType.Derived,
      factor: 1e9,
    }
  },
  getBalance() { // fetch...
    return {
      unconfirmed: amount(0, GRM),
      free: amount(1.23, GRM),
      locked: amount(0, GRM)
    }
  },
  getMinerFee() { // fetch...
    return amount(110, GRM.unit.Gwei)
  }
}

const coins = [BTC, ETH, GRM]


// Usage examples

amount(0.1, BTC)
//amount(0.1, BTC).plus(0.1, BTC)
amount(0.1, BTC.unit.BTC)
//amount(0.1, BTC.unit.BTC).plus(0.1, BTC.unit.BTC)
//amount(0.1, BTC.unit.BTC).plus(0.1, BTC.unit.sat)

// Conversions

//amount(1, BTC).toUnit(BTC.unit.sat)
//amount(1, BTC.unit.sat).toUnit(BTC)
//amount(1, ETH.unit.wei).toUnit(ETH)
//amount(1, ETH).toUnit(ETH.unit.wei)

// Piping

//amount(1, ETH).plus(10000, ETH.unit.wei).plus(0.2, ETH)


// Wrong usage examples

// error: unknown unit
amount(1, BTC.unit.unknown)

// error: float smaller unit
amount(0.5, BTC.unit.sat)
amount(1.5, BTC.unit.sat)

// error: different coins, different units
//amount(1, BTC).plus(1, ETH)
//amount(1, BTC.unit.BTC).plus(1, ETH.unit.ETH)

// error: different coins, same units
//amount(1, ETH.unit.wei).plus(1, ETC.unit.wei)


// Usecase: balance view

/*coins.forEach(coin => {
  const balance = coin.getBalance()
  const output = `${coin.title} | ${balance.value.toString()} ${balance.unit}`
  console.log(output)
})*/


// Usecase: tx (sendAmount + minerFee <= balance)

const sendAmount = amount(0.1, BTC.unit.BTC)
/*
const sendAmount = Amount(0.1, BTC.unit.default)
const sendAmount = Amount(0.1, BTC) // use overload?
*/
const minerFee = BTC.getMinerFee()
const balance = BTC.getBalance()

//const isTxAvailable = sendAmount.plus(minerFee).isLessThan(balance)