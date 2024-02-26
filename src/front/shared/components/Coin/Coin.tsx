import CSSModules from 'react-css-modules'
import web3Icons from 'images'
import styles from './Coin.scss'
import CurrencyIcon, { currencyIcons } from 'components/ui/CurrencyIcon/CurrencyIcon'
import config from 'app-config'

const defaultCurrencyColors = {
  'btc': 'orange',
  'btc (multisig)': 'orange',
  'btc (sms-protected)': 'orange',
  'btc (pin-protected)': 'orange',
  'matic': '#8247e5',
  'xdai': '#48a9a6',
  'ftm': '#11b4ec',
  'avax': '#e84142',
  'movr': 'white',
  'one': 'white',
  'ame': 'white',
  'aureth': '#ECEEF0',
  'phi_v1': '#1C0237',
  'phi': '#1C0237',
  'fkw': '#f2f9f6',
  'phpx': '#000000',
  'usdt': '#33a681',
  'ghost': 'black',
  'next': 'white',
}

type CoinProps = {
  className?: string
  size?: number
  name: string
}

const Coin = function (props: CoinProps) {
  const {
    size = 40,
    className,
    name,
  } = props

  const lowerName = name.toLowerCase()
  const isIconExist = currencyIcons.includes(lowerName)
  const iconSource = web3Icons[name]
  let isIconConfigExist = false

  if (
    config?.erc20[lowerName]?.icon
    || config?.bep20[lowerName]?.icon
    || config?.erc20matic[lowerName]?.icon
    || config?.erc20xdai[lowerName]?.icon
    || config?.erc20ftm[lowerName]?.icon
    || config?.erc20avax[lowerName]?.icon
    || config?.erc20movr[lowerName]?.icon
    || config?.erc20one[lowerName]?.icon
    || config?.erc20ame[lowerName]?.icon
    || config?.erc20aurora[lowerName]?.icon
    || config?.phi20_v1[lowerName]?.icon
    || config?.phi20[lowerName]?.icon
    || config?.fkw20[lowerName]?.icon
    || config?.phpx20[lowerName]?.icon
  ) {
    isIconConfigExist = true
  }

  // Coin styles *************************

  const style: {
    [ k: string]: string
  } = {
    width: `${size}px`,
    height: `${size}px`,
  }

  if (defaultCurrencyColors[lowerName]) {
    style.backgroundColor = defaultCurrencyColors[lowerName]
  }

  if (config?.erc20[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20[lowerName].iconBgColor
  }

  if (config?.bep20[lowerName]?.iconBgColor) {
    style.backgroundColor = config.bep20[lowerName].iconBgColor
  }

  if (config?.erc20matic[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20matic[lowerName].iconBgColor
  }

  if (config?.erc20xdai[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20xdai[lowerName].iconBgColor
  }

  if (config?.erc20ftm[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20ftm[lowerName].iconBgColor
  }

  if (config?.erc20avax[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20avax[lowerName].iconBgColor
  }

  if (config?.erc20movr[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20movr[lowerName].iconBgColor
  }

  if (config?.erc20one[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20one[lowerName].iconBgColor
  }

  if (config?.erc20ame[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20ame[lowerName].iconBgColor
  }

  if (config?.erc20aurora[lowerName]?.iconBgColor) {
    style.backgroundColor = config.erc20aurora[lowerName].iconBgColor
  }

  if (config?.phi20_v1[lowerName]?.iconBgColor) {
    style.backgroundColor = config.phi20_v1[lowerName].iconBgColor
  }

  if (config?.fkw20[lowerName]?.iconBgColor) {
    style.backgroundColor = config.fkw20[lowerName].iconBgColor
  }
  
  if (config?.phpx20[lowerName]?.iconBgColor) {
    style.backgroundColor = config.phpx20[lowerName].iconBgColor
  }

  // *************************************

  if (config?.isWidget && window?.widgetEvmLikeTokens?.length) {
    window.widgetEvmLikeTokens.forEach((token) =>  {
      if (token.name.toLowerCase() === lowerName) {
        if (token.icon) isIconConfigExist = true
        if (token.iconBgColor) (style.backgroundColor = token.iconBgColor)
      }
    })
  }

  const currencyIconProps = {
    name: lowerName,
    styleName: '',
    style: {},
    source: iconSource,
  }

  if (isIconExist || isIconConfigExist) {
    currencyIconProps.styleName = 'icon'
  } else {
    currencyIconProps.styleName = 'letter'
    currencyIconProps.style = {
      lineHeight: `${size}px`,
      fontSize: `${size / 2}px`,
    }
  }

  return (
    <div
      styleName={`coin ${iconSource ? 'noColors' : ''}`}
      className={className}
      style={style}
    >
      <CurrencyIcon {...currencyIconProps} />
    </div>
  )
}

export default CSSModules(Coin, styles, { allowMultiple: true })
