import constants from '../constants'
import { BLOCKCHAIN as BLOCKCHAIN_TYPE, COIN_DATA, COIN_TYPE, TOKEN_STANDARD } from '../constants/COINS'
import typeforce from './typeforce'

class TokenRegistrar {
  readonly blockchainType: string // BLOCKCHAIN_TYPE

  readonly tokenStandard: string // TOKEN_STANDARD

  readonly coinType: string // COIN_TYPE

  readonly blockchainModel: string // COIN_DATA[baseCurrency].model

  readonly isCoinAddress: (value: any) => boolean

  readonly isPublicKey: string | ((value: any) => boolean)

  constructor(params) {
    const {
      blockchainType,
      tokenStandard,
      coinType,
      blockchainModel,
      isCoinAddress,
      isPublicKey,
    } = params

    this.blockchainType = blockchainType
    this.tokenStandard = tokenStandard
    this.coinType = coinType
    this.blockchainModel = blockchainModel
    this.isCoinAddress = isCoinAddress
    this.isPublicKey = isPublicKey
  }

  register = (code, precision) => {
    const tokenCode = `{${this.blockchainType}}${code}`
    constants.COINS[tokenCode] = tokenCode.toUpperCase()
    constants.COIN_DATA[tokenCode.toUpperCase()] = {
      ticker: tokenCode.toUpperCase(),
      name: code.toUpperCase(),
      blockchain: this.blockchainType,
      standard: this.tokenStandard,
      type: this.coinType,
      model: this.blockchainModel,
      precision,
    }
    typeforce.isCoinAddress[tokenCode.toUpperCase()] = this.isCoinAddress
    typeforce.isPublicKey[tokenCode.toUpperCase()] = this.isPublicKey
  }
}

export default {
  erc20: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.ETH,
    tokenStandard: TOKEN_STANDARD.ERC20,
    coinType: COIN_TYPE.ETH_TOKEN,
    blockchainModel: COIN_DATA.ETH.model,
    isCoinAddress: typeforce.isCoinAddress.ETH,
    isPublicKey: typeforce.isPublicKey.ETH,
  }),
  bep20: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.BNB,
    tokenStandard: TOKEN_STANDARD.BEP20,
    coinType: COIN_TYPE.BNB_TOKEN,
    blockchainModel: COIN_DATA.BNB.model,
    isCoinAddress: typeforce.isCoinAddress.BNB,
    isPublicKey: typeforce.isPublicKey.BNB,
  }),
  erc20aurora: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.AURETH,
    tokenStandard: TOKEN_STANDARD.ERC20AURORA,
    coinType: COIN_TYPE.AURORA_TOKEN,
    blockchainModel: COIN_DATA.AURETH.model,
    isCoinAddress: typeforce.isCoinAddress.AURETH,
    isPublicKey: typeforce.isPublicKey.AURETH,
  }),
  erc20avax: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.AVAX,
    tokenStandard: TOKEN_STANDARD.ERC20AVAX,
    coinType: COIN_TYPE.AVAX_TOKEN,
    blockchainModel: COIN_DATA.AVAX.model,
    isCoinAddress: typeforce.isCoinAddress.AVAX,
    isPublicKey: typeforce.isPublicKey.AVAX,
  }),
  erc20ftm: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.FTM,
    tokenStandard: TOKEN_STANDARD.ERC20FTM,
    coinType: COIN_TYPE.FTM_TOKEN,
    blockchainModel: COIN_DATA.FTM.model,
    isCoinAddress: typeforce.isCoinAddress.FTM,
    isPublicKey: typeforce.isPublicKey.FTM,
  }),
  erc20matic: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.MATIC,
    tokenStandard: TOKEN_STANDARD.ERC20MATIC,
    coinType: COIN_TYPE.MATIC_TOKEN,
    blockchainModel: COIN_DATA.MATIC.model,
    isCoinAddress: typeforce.isCoinAddress.MATIC,
    isPublicKey: typeforce.isPublicKey.MATIC,
  }),
  erc20movr: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.MOVR,
    tokenStandard: TOKEN_STANDARD.ERC20MOVR,
    coinType: COIN_TYPE.MOVR_TOKEN,
    blockchainModel: COIN_DATA.MOVR.model,
    isCoinAddress: typeforce.isCoinAddress.MOVR,
    isPublicKey: typeforce.isPublicKey.MOVR,
  }),
  erc20one: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.ONE,
    tokenStandard: TOKEN_STANDARD.ERC20ONE,
    coinType: COIN_TYPE.ONE_TOKEN,
    blockchainModel: COIN_DATA.ONE.model,
    isCoinAddress: typeforce.isCoinAddress.ONE,
    isPublicKey: typeforce.isPublicKey.ONE,
  }),
  erc20ame: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.AME,
    tokenStandard: TOKEN_STANDARD.ERC20AME,
    coinType: COIN_TYPE.AME_TOKEN,
    blockchainModel: COIN_DATA.AME.model,
    isCoinAddress: typeforce.isCoinAddress.AME,
    isPublicKey: typeforce.isPublicKey.AME,
  }),
  erc20xdai: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.XDAI,
    tokenStandard: TOKEN_STANDARD.ERC20XDAI,
    coinType: COIN_TYPE.XDAI_TOKEN,
    blockchainModel: COIN_DATA.XDAI.model,
    isCoinAddress: typeforce.isCoinAddress.XDAI,
    isPublicKey: typeforce.isPublicKey.XDAI,
  }),
  phi20_v1: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.PHI_V1,
    tokenStandard: TOKEN_STANDARD.PHI20_V1,
    coinType: COIN_TYPE.PHI_V1_TOKEN,
    blockchainModel: COIN_DATA.PHI_V1.model,
    isCoinAddress: typeforce.isCoinAddress.PHI_V1,
    isPublicKey: typeforce.isPublicKey.PHI_V1,
  }),
  phi20: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.PHI,
    tokenStandard: TOKEN_STANDARD.PHI20,
    coinType: COIN_TYPE.PHI_TOKEN,
    blockchainModel: COIN_DATA.PHI.model,
    isCoinAddress: typeforce.isCoinAddress.PHI,
    isPublicKey: typeforce.isPublicKey.PHI,
  }),
  fkw20: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.FKW,
    tokenStandard: TOKEN_STANDARD.FKW20,
    coinType: COIN_TYPE.FKW_TOKEN,
    blockchainModel: COIN_DATA.FKW.model,
    isCoinAddress: typeforce.isCoinAddress.FKW,
    isPublicKey: typeforce.isPublicKey.FKW,
  }),
  phpx20: new TokenRegistrar({
    blockchainType: BLOCKCHAIN_TYPE.PHPX,
    tokenStandard: TOKEN_STANDARD.PHPX20,
    coinType: COIN_TYPE.PHPX_TOKEN,
    blockchainModel: COIN_DATA.PHPX.model,
    isCoinAddress: typeforce.isCoinAddress.PHPX,
    isPublicKey: typeforce.isPublicKey.PHPX,
  }),
}
